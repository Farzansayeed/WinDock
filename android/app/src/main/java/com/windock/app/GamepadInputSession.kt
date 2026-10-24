package com.windock.app

/** Native Kotlin VS1 sender model, NOT a network socket, pairing bypass, or XInput driver.
 *
 * Call ready() ONLY after an authenticated, single-owner /gamepad v1 ready frame.
 * The future caller MUST drive tick() every ~10 ms while active and call close()
 * on touch cancellation, background, navigation, lost socket, and failure.
 * Never depend on this alone: Windows must independently neutralize on timeout.
 */
internal fun interface GamepadFrameTransport {
    /** False means the frame could not be queued immediately; never buffer unbounded states. */
    fun sendText(frame: String): Boolean
}

internal class GamepadInputSession(
    private val transport: GamepadFrameTransport,
    private val clockMs: () -> Long,
    private val heartbeatMs: Long = 40L,
    private val minimumAxisIntervalMs: Long = 20L,
) {
    init {
        require(heartbeatMs in 30L..80L)
        require(minimumAxisIntervalMs in 10L..heartbeatMs)
    }

    private enum class Phase { WAITING, ACTIVE, CLOSED }
    @Volatile private var phase = Phase.WAITING
    private val encoder = GamepadFrameEncoder()
    private var desired = GamepadTouchModel.State()
    private var lastSentState = GamepadTouchModel.State()
    private var lastSentAt: Long? = null
    internal val isActive: Boolean get() = phase == Phase.ACTIVE
    internal val isClosed: Boolean get() = phase == Phase.CLOSED

    /** A new authenticated session starts with an explicit, whole-state neutral report. */
    @Synchronized fun ready(): Boolean {
        if (phase != Phase.WAITING) return false
        phase = Phase.ACTIVE
        return send(GamepadTouchModel.State(), clockMs())
    }

    /** A-button edges are immediate. Stick-only motion is coalesced to at most 50 Hz. */
    @Synchronized fun update(state: GamepadTouchModel.State): Boolean {
        if (phase != Phase.ACTIVE) return false
        desired = state
        if (desired == lastSentState) return true
        val now = clockMs()
        if (!clockOk(now)) return failClosed()
        if (desired.a != lastSentState.a || now - lastSentAt!! >= minimumAxisIntervalMs)
            return send(desired, now)
        return true
    }

    /** Re-sends full held state periodically so native watchdog can measure freshness. */
    @Synchronized fun tick(): Boolean {
        if (phase != Phase.ACTIVE) return false
        val now = clockMs()
        if (!clockOk(now)) return failClosed()
        val age = now - lastSentAt!!
        if ((desired != lastSentState && age >= minimumAxisIntervalMs) || age >= heartbeatMs)
            return send(desired, now)
        return true
    }

    /** Idempotent, best-effort final neutral; Windows watchdog still owns hard safety. */
    @Synchronized fun close() {
        if (phase == Phase.CLOSED) return
        val wasActive = phase == Phase.ACTIVE
        phase = Phase.CLOSED
        desired = GamepadTouchModel.State()
        if (wasActive) sendNeutralBestEffort()
    }

    private fun clockOk(now: Long): Boolean = lastSentAt == null || now >= lastSentAt!!

    private fun send(state: GamepadTouchModel.State, now: Long): Boolean {
        if (!clockOk(now)) return failClosed()
        val frame = try { encoder.next(state) }
            catch (_: RuntimeException) { return failClosed() }
        val sent = try { transport.sendText(frame) }
            catch (_: Exception) { false }
        if (!sent) return failClosed()
        lastSentAt = now
        lastSentState = state
        return true
    }

    private fun failClosed(): Boolean {
        close() // Lost IPC cannot guarantee final neutral; native timer must still expire.
        return false
    }

    private fun sendNeutralBestEffort() {
        try { transport.sendText(encoder.neutral()) } catch (_: Exception) { }
    }
}
