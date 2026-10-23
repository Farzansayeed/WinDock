package com.windock.app

import kotlin.math.hypot
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Local-only first-slice gamepad touch ownership, independent of Android UI.
 * Actual controller networking and virtual device output do NOT exist yet.
 */
internal class GamepadTouchModel {
    internal data class State(val lx: Int = 0, val ly: Int = 0, val a: Boolean = false)
    private var stickPointer: Int? = null
    private var buttonPointer: Int? = null
    private var stickX = 0f
    private var stickY = 0f
    private var aPressed = false

    fun press(pointerId: Int, x: Float, y: Float, width: Float, height: Float) {
        if (width <= 0 || height <= 0 || pointerId < 0) return
        val r = min(width * .17f, height * .23f).coerceAtLeast(1f)
        val sx = width * .24f
        val sy = height * .58f
        val ax = width * .78f
        val ay = height * .58f
        val aRadius = min(width * .09f, height * .17f).coerceAtLeast(1f)
        if (stickPointer == null && pointerId != buttonPointer &&
            hypot(x - sx, y - sy) <= r * 1.4f) {
            stickPointer = pointerId
            updateStick(x, y, width, height)
        } else if (buttonPointer == null && pointerId != stickPointer &&
            hypot(x - ax, y - ay) <= aRadius * 1.4f) {
            buttonPointer = pointerId
            aPressed = true
        }
    }

    fun move(pointerId: Int, x: Float, y: Float, width: Float, height: Float) {
        if (pointerId == stickPointer && width > 0 && height > 0)
            updateStick(x, y, width, height)
        // Button is held by its original pointer until UP/CANCEL,
        // even if the thumb briefly slides outside its illustrated ring.
    }

    fun release(pointerId: Int) {
        if (pointerId == stickPointer) {
            stickPointer = null
            stickX = 0f
            stickY = 0f
        }
        if (pointerId == buttonPointer) {
            buttonPointer = null
            aPressed = false
        }
    }

    fun clear() {
        stickPointer = null
        buttonPointer = null
        stickX = 0f
        stickY = 0f
        aPressed = false
    }

    fun state(): State = State(
        lx = (stickX * 32767f).roundToInt().coerceIn(-32767, 32767),
        ly = (-stickY * 32767f).roundToInt().coerceIn(-32767, 32767),
        a = aPressed,
    )

    private fun updateStick(x: Float, y: Float, width: Float, height: Float) {
        val r = min(width * .17f, height * .23f).coerceAtLeast(1f)
        val rawX = (x - width * .24f) / r
        val rawY = (y - height * .58f) / r
        val magnitude = hypot(rawX, rawY)
        val scale = if (magnitude > 1f) 1f / magnitude else 1f
        val nx = rawX * scale
        val ny = rawY * scale
        // Simple initial six-percent deadzone. Tune with physical usability
        // tests; do NOT compound user/app/game deadzones blindly.
        stickX = if (kotlin.math.abs(nx) < .06f) 0f else nx
        stickY = if (kotlin.math.abs(ny) < .06f) 0f else ny
    }
}
