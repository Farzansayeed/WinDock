package com.windock.app

import org.junit.Assert.*
import org.junit.Test

class GamepadTouchModelTest {
    private val w = 1000f
    private val h = 500f

    @Test fun stickIsContinuousWithCorrectYAndRelease() {
        val pad = GamepadTouchModel()
        pad.press(11, 240f, 290f, w, h)
        assertEquals(0, pad.state().lx)
        assertEquals(0, pad.state().ly)
        pad.move(11, 360f, 290f, w, h)
        assertTrue(pad.state().lx > 0)
        assertEquals(0, pad.state().ly)
        pad.move(11, 240f, 200f, w, h)
        assertTrue(pad.state().ly > 0)
        pad.release(11)
        assertEquals(GamepadTouchModel.State(), pad.state())
    }

    @Test fun twoIndependentPointersCanUseStickAndA() {
        val pad = GamepadTouchModel()
        pad.press(3, 240f, 290f, w, h)
        pad.press(8, 780f, 290f, w, h)
        pad.move(3, 340f, 290f, w, h)
        assertTrue(pad.state().lx > 0)
        assertTrue(pad.state().a)
        pad.release(3)
        assertEquals(0, pad.state().lx)
        assertTrue(pad.state().a)
        pad.release(8)
        assertFalse(pad.state().a)
    }

    @Test fun pointerOwnershipCannotBeStolenOrDuplicated() {
        val pad = GamepadTouchModel()
        pad.press(2, 240f, 290f, w, h)
        pad.press(5, 240f, 290f, w, h)
        pad.move(5, 380f, 290f, w, h)
        assertEquals(0, pad.state().lx)
        pad.press(2, 780f, 290f, w, h)
        assertFalse(pad.state().a)
        pad.release(2)
        pad.press(5, 780f, 290f, w, h)
        assertTrue(pad.state().a)
    }

    @Test fun buttonIsHeldUntilItsOwningFingerLiftsAndCancelNeutralizes() {
        val pad = GamepadTouchModel()
        pad.press(4, 780f, 290f, w, h)
        pad.move(4, 0f, 0f, w, h)
        assertTrue(pad.state().a)
        pad.release(99)
        assertTrue(pad.state().a)
        pad.clear()
        assertEquals(GamepadTouchModel.State(), pad.state())
    }

    @Test fun invalidGeometryDoesNotStartInputAndAxisIsBounded() {
        val pad = GamepadTouchModel()
        pad.press(1, 240f, 290f, 0f, h)
        assertEquals(GamepadTouchModel.State(), pad.state())
        pad.press(1, 240f, 290f, w, h)
        pad.move(1, 100000f, 100000f, w, h)
        assertTrue(kotlin.math.abs(pad.state().lx) <= 32767)
        assertTrue(kotlin.math.abs(pad.state().ly) <= 32767)
        pad.clear()
        assertEquals(GamepadTouchModel.State(), pad.state())
    }
}
