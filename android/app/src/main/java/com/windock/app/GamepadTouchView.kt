package com.windock.app

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.MotionEvent
import android.view.View
import kotlin.math.min

/**
 * Native Kotlin Android input preview with real pointer-ID multitouch.
 * The model is kept local: NOTHING is sent to the host or a virtual device.
 */
internal class GamepadTouchView(context: Context) : View(context) {
    private val model = GamepadTouchModel()
    // Future VS1 sender can observe native input without letting WebView
    // synthesize controller reports. Currently null: this UI remains local only.
    internal var onStateChanged: ((GamepadTouchModel.State) -> Unit)? = null
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val background = Color.rgb(10, 16, 27)
    private val outline = Color.rgb(82, 121, 174)
    private val ink = Color.rgb(220, 235, 255)
    private val accent = Color.rgb(75, 154, 235)

    init {
        setBackgroundColor(background)
        contentDescription = "Native local-only gamepad input test. Left stick and A button. Not connected to a PC controller."
        isFocusable = true
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()
        if (w <= 0 || h <= 0) return
        val r = min(w * .17f, h * .23f).coerceAtLeast(1f)
        val aRadius = min(w * .09f, h * .17f).coerceAtLeast(1f)
        val sx = w * .24f
        val sy = h * .58f
        val ax = w * .78f
        val ay = h * .58f
        val state = model.state()

        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 3f * resources.displayMetrics.density
        paint.color = outline
        canvas.drawCircle(sx, sy, r, paint)
        canvas.drawCircle(ax, ay, aRadius, paint)

        paint.style = Paint.Style.FILL
        paint.color = if (state.lx != 0 || state.ly != 0) accent else Color.rgb(32, 53, 78)
        canvas.drawCircle(sx + state.lx / 32767f * r * .58f,
            sy - state.ly / 32767f * r * .58f, r * .45f, paint)
        paint.color = if (state.a) accent else Color.rgb(32, 53, 78)
        canvas.drawCircle(ax, ay, aRadius * .8f, paint)

        paint.color = ink
        paint.textAlign = Paint.Align.CENTER
        paint.textSize = min(h * .08f, 30f * resources.displayMetrics.scaledDensity)
        canvas.drawText("A", ax, ay + paint.textSize * .35f, paint)
        paint.textSize = min(h * .053f, 20f * resources.displayMetrics.scaledDensity)
        canvas.drawText("LEFT STICK", sx, sy + r + paint.textSize * 1.6f, paint)
        canvas.drawText("LOCAL INPUT TEST ONLY — NO PC CONTROLLER",
            w * .5f, h * .2f, paint)
        canvas.drawText("LX ${state.lx}   LY ${state.ly}   A ${if (state.a) "DOWN" else "UP"}",
            w * .5f, h * .92f, paint)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.actionMasked) {
            MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                val index = event.actionIndex
                model.press(event.getPointerId(index), event.getX(index), event.getY(index),
                    width.toFloat(), height.toFloat())
            }
            MotionEvent.ACTION_MOVE -> {
                for (index in 0 until event.pointerCount)
                    model.move(event.getPointerId(index), event.getX(index), event.getY(index),
                        width.toFloat(), height.toFloat())
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                model.release(event.getPointerId(event.actionIndex))
            }
            MotionEvent.ACTION_CANCEL -> model.clear()
            else -> return true
        }
        onStateChanged?.invoke(model.state())
        invalidate()
        return true
    }

    fun neutralize() {
        model.clear()
        onStateChanged?.invoke(model.state())
        invalidate()
    }

    override fun onDetachedFromWindow() {
        neutralize()
        super.onDetachedFromWindow()
    }
}
