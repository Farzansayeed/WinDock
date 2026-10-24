package com.windock.app

import org.json.JSONObject
import java.nio.charset.StandardCharsets

/** A future authenticated WebSocket adapter; no network is started here. */
internal interface GamepadOwnedSocket {
    /** Must refuse sends after close and return false on backpressure/failure. */
    fun sendText(frame: String): Boolean
    fun close()
}

/**
 * VS1 owner/handshake lifecycle for an already paired local connection.
 *
 * This class DOES NOT open sockets, read cookies, or attach a driver.
 * Its future caller MUST validate GamepadSocketTarget from the active WebView,
 * attach the existing paired cookie only to that exact origin and send an
 * Origin header that matches, then call onServerMessage only for that socket.
 * A native Windows watchdog is still mandatory, even when Android closes.
 */
internal class GamepadOwnerChannel(
    private val socket: GamepadOwnedSocket,
    private val clockMs: () -> Long,
    private val handshakeTimeoutMs: Long = 1000L,
) {
    init { require(handshakeTimeoutMs in 200L..3000L) }
    private enum class Phase { WAITING, ACTIVE, CLOSED }
    private var phase = Phase.WAITING
    private val openedAt = clockMs()
    private val frames = GamepadInputSession(
        GamepadFrameTransport { socket.sendText(it) }, clockMs
    )
    internal val isActive: Boolean get() = phase == Phase.ACTIVE && frames.isActive
    internal val isClosed: Boolean get() = phase == Phase.CLOSED

    /** Only one v1 ready acknowledgment is allowed per authenticated session. */
    @Synchronized fun onServerMessage(raw: String): Boolean {
        if (phase != Phase.WAITING || !validReady(raw)) return abort()
        if (clockMs() < openedAt || clockMs() - openedAt > handshakeTimeoutMs)
            return abort()
        phase = Phase.ACTIVE
        if (!frames.ready()) return abort()
        return true
    }

    /** Touch events before ready are never queued or replayed after pairing. */
    @Synchronized fun onTouch(state: GamepadTouchModel.State): Boolean {
        if (!isActive) return false
        if (!frames.update(state)) return abort()
        return true
    }

    /** The caller must tick this approximately every 10 ms, even when idle. */
    @Synchronized fun onTick(): Boolean {
        if (phase == Phase.WAITING) {
            val now = clockMs()
            if (now < openedAt || now - openedAt > handshakeTimeoutMs) return abort()
            return true
        }
        if (!isActive) return false
        if (!frames.tick()) return abort()
        return true
    }

    /** On app pause, WebView navigation, network loss, cancellation and error. */
    @Synchronized fun close() { abort() }

    private fun validReady(raw: String): Boolean {
        if (raw.toByteArray(StandardCharsets.UTF_8).size !in 1..96) return false
        return try {
            val obj = JSONObject(raw)
            obj.length() == 2 &&
                obj.opt("type") == "ready" &&
                obj.opt("v") is Int && obj.optInt("v") == 1
        } catch (_: Exception) { false }
    }

    private fun abort(): Boolean {
        if (phase == Phase.CLOSED) return false
        phase = Phase.CLOSED
        frames.close() // best-effort all-neutral before socket closure
        try { socket.close() } catch (_: Exception) { }
        return false
    }
}
