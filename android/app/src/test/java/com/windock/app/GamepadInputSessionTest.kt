package com.windock.app

import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

/** Fake transport only; never claims Android-to-PC gameplay or Xbox hardware. */
class GamepadInputSessionTest {
    private fun parse(frames: List<String>) = frames.map { JSONObject(it) }

    @Test fun doesNotTransmitBeforeAuthenticatedReady() {
        val frames = mutableListOf<String>()
        val session = GamepadInputSession(GamepadFrameTransport { frames.add(it); true }, { 0L })
        assertFalse(session.isActive)
        assertFalse(session.tick())
        assertFalse(session.update(GamepadTouchModel.State(0, 0, true)))
        assertTrue(frames.isEmpty())
        assertTrue(session.ready())
        assertEquals(0, parse(frames).single().getInt("buttons"))
        assertEquals(1, parse(frames).single().getInt("seq"))
        assertFalse(session.ready())
    }

    @Test fun sticksAreCoalescedButButtonPressAndReleaseAreImmediate() {
        var now = 0L
        val frames = mutableListOf<String>()
        val session = GamepadInputSession(GamepadFrameTransport { frames.add(it); true }, { now })
        assertTrue(session.ready())
        now = 1L
        assertTrue(session.update(GamepadTouchModel.State(8000, 0, false)))
        assertEquals(1, frames.size)
        now = 19L
        assertTrue(session.tick())
        assertEquals(1, frames.size)
        now = 20L
        assertTrue(session.tick())
        assertEquals(8000, parse(frames).last().getInt("lx"))
        now = 21L
        assertTrue(session.update(GamepadTouchModel.State(8000, 0, true)))
        assertEquals(4096, parse(frames).last().getInt("buttons"))
        now = 22L
        assertTrue(session.update(GamepadTouchModel.State(8000, 0, false)))
        assertEquals(0, parse(frames).last().getInt("buttons"))
        assertEquals(listOf(1, 2, 3, 4), parse(frames).map { it.getInt("seq") })
    }

    @Test fun heldStateHeartbeatsAndExitAlwaysNeutralize() {
        var now = 0L
        val frames = mutableListOf<String>()
        val session = GamepadInputSession(GamepadFrameTransport { frames.add(it); true }, { now })
        assertTrue(session.ready())
        now = 40L
        assertTrue(session.tick())
        assertEquals(2, frames.size)
        assertEquals(0, parse(frames).last().getInt("buttons"))
        now = 41L
        assertTrue(session.update(GamepadTouchModel.State(20000, -15000, true)))
        now = 81L
        assertTrue(session.tick())
        assertEquals(4096, parse(frames).last().getInt("buttons"))
        session.close()
        session.close()
        assertTrue(session.isClosed)
        assertFalse(session.isActive)
        val result = parse(frames)
        assertEquals(5, result.size)
        for (field in listOf("lx", "ly", "rx", "ry", "lt", "rt", "buttons"))
            assertEquals("must neutralize $field", 0, result.last().getInt(field))
        assertFalse(session.update(GamepadTouchModel.State(a = true)))
        assertFalse(session.tick())
        assertEquals(5, frames.size)
    }

    @Test fun failedTransportTerminatesAndDoesNotContinueSending() {
        val frames = mutableListOf<String>()
        val session = GamepadInputSession(GamepadFrameTransport {
            frames.add(it)
            frames.size < 2
        }, { 0L })
        assertTrue(session.ready())
        assertFalse(session.update(GamepadTouchModel.State(a = true)))
        assertTrue(session.isClosed)
        assertEquals(3, frames.size) // initial neutral, failed A, attempted final neutral
        assertEquals(0, parse(frames).last().getInt("buttons"))
        assertFalse(session.ready())
        assertFalse(session.tick())
    }

    @Test fun exceptionsAndBackwardClockFailClosed() {
        var now = 100L
        val outputs = mutableListOf<String>()
        val session = GamepadInputSession(GamepadFrameTransport { outputs.add(it); true }, { now })
        assertTrue(session.ready())
        now = 90L
        assertFalse(session.tick())
        assertTrue(session.isClosed)
        assertEquals(0, parse(outputs).last().getInt("buttons"))

        val broken = GamepadInputSession(GamepadFrameTransport { throw IllegalStateException() }, { 1L })
        assertFalse(broken.ready())
        assertTrue(broken.isClosed)
    }

    @Test fun freshOwnerGetsNewSequenceAndBadTimingIsRefused() {
        val first = mutableListOf<String>()
        val second = mutableListOf<String>()
        val s1 = GamepadInputSession(GamepadFrameTransport { first.add(it); true }, { 0L })
        assertTrue(s1.ready())
        s1.close()
        val s2 = GamepadInputSession(GamepadFrameTransport { second.add(it); true }, { 0L })
        assertTrue(s2.ready())
        assertEquals(1, parse(second).single().getInt("seq"))
        try {
            GamepadInputSession(GamepadFrameTransport { true }, { 0L }, heartbeatMs = 200L)
            fail("unsafe heartbeat should be rejected")
        } catch (_: IllegalArgumentException) { }
    }

    @Test fun realTouchModelProducesStickAndButtonWholeStates() {
        val model = GamepadTouchModel()
        val frames = mutableListOf<String>()
        var now = 0L
        val session = GamepadInputSession(GamepadFrameTransport { frames.add(it); true }, { now })
        assertTrue(session.ready())
        model.press(1, 240f, 290f, 1000f, 500f)
        model.press(2, 780f, 290f, 1000f, 500f)
        model.move(1, 350f, 290f, 1000f, 500f)
        now = 5L
        assertTrue(session.update(model.state()))
        assertEquals(4096, parse(frames).last().getInt("buttons"))
        assertTrue(parse(frames).last().getInt("lx") > 0)
        model.clear() // mimics pointer cancellation/lifecycle neutral
        now = 6L
        assertTrue(session.update(model.state()))
        assertEquals(0, parse(frames).last().getInt("buttons"))
        session.close()
        assertEquals(0, parse(frames).last().getInt("lx"))
    }
}
