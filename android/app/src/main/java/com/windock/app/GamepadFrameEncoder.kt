package com.windock.app

/**
 * V1 full-state serializer shared in SHAPE with src/gamepad/protocol.js and
 * native/gamepad-tests/GamepadState.cs. It ONLY builds immutable JSON payloads:
 * no socket, pairing bypass, input emulation or Windows gamepad is created.
 *
 * Create a fresh encoder on a NEW authenticated /gamepad owner session.
 * Never wrap sequence numbers: an exhausted session must reconnect and reset.
 */
internal class GamepadFrameEncoder {
    private var sequence = 0

    fun next(state: GamepadTouchModel.State): String {
        check(sequence < Int.MAX_VALUE) { "Gamepad sequence exhausted; reconnect first." }
        val seq = ++sequence
        val lx = state.lx.coerceIn(-32768, 32767)
        val ly = state.ly.coerceIn(-32768, 32767)
        val buttons = if (state.a) 0x1000 else 0
        return """{"v":1,"type":"state","seq":$seq,"lx":$lx,"ly":$ly,"rx":0,"ry":0,"lt":0,"rt":0,"buttons":$buttons}"""
    }

    /** Always send an explicit final neutral snapshot before normal disconnect. */
    fun neutral(): String = next(GamepadTouchModel.State())
}
