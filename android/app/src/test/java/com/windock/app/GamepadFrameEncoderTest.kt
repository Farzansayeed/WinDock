package com.windock.app

import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

class GamepadFrameEncoderTest {
    @Test fun emitsExactV1WholeStateAndMonotonicSequence() {
        val codec = GamepadFrameEncoder()
        val first = JSONObject(codec.next(GamepadTouchModel.State(12000, -23000, true)))
        assertEquals(10, first.length())
        assertEquals(1, first.getInt("v"))
        assertEquals("state", first.getString("type"))
        assertEquals(1, first.getInt("seq"))
        assertEquals(12000, first.getInt("lx"))
        assertEquals(-23000, first.getInt("ly"))
        assertEquals(0, first.getInt("rx"))
        assertEquals(0, first.getInt("ry"))
        assertEquals(0, first.getInt("lt"))
        assertEquals(0, first.getInt("rt"))
        assertEquals(0x1000, first.getInt("buttons"))
        assertTrue(codec.next(GamepadTouchModel.State()).contains("\"seq\":2"))
    }

    @Test fun neutralFrameResetsEveryFieldWithNewSequence() {
        val codec = GamepadFrameEncoder()
        codec.next(GamepadTouchModel.State(32767, -32768, true))
        val neutral = JSONObject(codec.neutral())
        assertEquals(2, neutral.getInt("seq"))
        for (axis in listOf("lx", "ly", "rx", "ry", "lt", "rt", "buttons"))
            assertEquals("neutral $axis", 0, neutral.getInt(axis))
    }

    @Test fun clampsStrayModelAxesAndPreservesButtonIdentity() {
        val frame = JSONObject(GamepadFrameEncoder().next(
            GamepadTouchModel.State(Int.MAX_VALUE, Int.MIN_VALUE, true)))
        assertEquals(32767, frame.getInt("lx"))
        assertEquals(-32768, frame.getInt("ly"))
        assertEquals(4096, frame.getInt("buttons"))
    }

    @Test fun touchModelMultitouchCanBeSerializedWithoutLosingA() {
        val pad = GamepadTouchModel()
        pad.press(1, 240f, 290f, 1000f, 500f)
        pad.press(2, 780f, 290f, 1000f, 500f)
        pad.move(1, 350f, 290f, 1000f, 500f)
        val active = JSONObject(GamepadFrameEncoder().next(pad.state()))
        assertTrue(active.getInt("lx") > 0)
        assertEquals(4096, active.getInt("buttons"))
        pad.clear()
        val stopped = JSONObject(GamepadFrameEncoder().next(pad.state()))
        assertEquals(0, stopped.getInt("buttons"))
        assertEquals(0, stopped.getInt("lx"))
    }
}
