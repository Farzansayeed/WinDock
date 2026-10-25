package com.windock.app

import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/** Only the existing valid WinDock pairing cookie is forwarded to the PC. */
internal object GamepadSessionCookie {
    fun extract(cookies: String?): String? {
        if (cookies.isNullOrBlank() || cookies.length > 4096 || '\r' in cookies || '\n' in cookies)
            return null
        val matches = cookies.split(';').map { it.trim() }
            .filter { it.startsWith("windock_session=") }
        if (matches.size != 1) return null
        val token = matches.single().removePrefix("windock_session=")
        // Node issues exactly 32 random bytes encoded as base64url, length 43.
        if (token.length != 43 || token.any {
                it !in 'A'..'Z' && it !in 'a'..'z' &&
                    it !in '0'..'9' && it != '-' && it != '_'
            }) return null
        return "windock_session=$token"
    }
}

/**
 * An explicitly enabled DEBUG-LAB driver-neutral transport. The existing
 * authenticated server, not this class, decides whether a session is paired.
 * One Kotlin owner/sequence/lease per instance; no global gamepad state.
 * Production /gamepad remains 503 and NO Xbox device is created here.
 */
internal class GamepadPairedWebSocket private constructor(
    private val target: GamepadSocketTarget,
    private val sessionCookie: String,
    private val status: (String) -> Unit,
) : GamepadOwnedSocket {
    companion object {
        private val client = OkHttpClient.Builder()
            .connectTimeout(3, TimeUnit.SECONDS)
            .pingInterval(10, TimeUnit.SECONDS)
            .build()

        fun begin(
            target: GamepadSocketTarget,
            browserCookies: String?,
            status: (String) -> Unit,
        ): GamepadPairedWebSocket? {
            val cookie = GamepadSessionCookie.extract(browserCookies) ?: return null
            return GamepadPairedWebSocket(target, cookie, status).also { it.connect() }
        }
    }

    private val owner = GamepadOwnerChannel(this, { System.nanoTime() / 1_000_000L })
    // Keep full-state heartbeats independent of Android View redraw timing.
    private val heartbeat = Executors.newSingleThreadScheduledExecutor { work ->
        Thread(work, "WinDock-Fake-LAB-Heartbeat").apply { isDaemon = true }
    }
    private var wire: WebSocket? = null
    @Volatile private var stopped = false

    private fun connect() {
        val request = Request.Builder().url(target.websocketUrl)
            .header("Origin", target.origin)
            .header("Cookie", sessionCookie).build()
        val launched = client.newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) {
                if (owner.onServerMessage(text)) status("lab-ready")
                else { owner.close(); status("lab-rejected") }
            }
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                owner.close(); status("lab-closed")
            }
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                owner.close(); status("lab-closed")
            }
            override fun onFailure(webSocket: WebSocket, error: Throwable, response: Response?) {
                // Never log exception bodies, Origin, cookie or IP address.
                owner.close(); status("lab-unavailable")
            }
        })
        synchronized(this) { if (stopped) launched.cancel() else wire = launched }
        if (!stopped) heartbeat.scheduleAtFixedRate({
            if (!stopped && !owner.onTick()) {
                status("lab-phone-heartbeat-stopped")
                owner.close()
            }
        }, 10L, 10L, TimeUnit.MILLISECONDS)
    }

    fun touch(state: GamepadTouchModel.State): Boolean {
        if (owner.isClosed) return false
        // Pre-readiness touches must not be replayed after the native ACK.
        return if (owner.isActive) owner.onTouch(state) else true
    }

    fun stop() { owner.close() }

    /** Bounded buffer: failure triggers owner abort and native PC watchdog. */
    override fun sendText(frame: String): Boolean = synchronized(this) {
        val ws = wire ?: return false
        if (stopped || ws.queueSize() > 4096L) return false
        ws.send(frame)
    }

    override fun close() {
        val old = synchronized(this) {
            if (stopped) return
            stopped = true
            wire.also { wire = null }
        }
        heartbeat.shutdownNow()
        old?.close(1000, null)
    }
}
