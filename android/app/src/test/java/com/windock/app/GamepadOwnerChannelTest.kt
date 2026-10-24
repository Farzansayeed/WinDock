package com.windock.app

import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test

/** Tests simulate an authenticated WS; no network, pairing token or Xbox driver. */
class GamepadOwnerChannelTest {
    private class FakeSocket : GamepadOwnedSocket {
        val frames = mutableListOf<JSONObject>()
        var closes = 0
        var allowSends = true
        override fun sendText(frame: String): Boolean {
            frames.add(JSONObject(frame))
            return allowSends
        }
        override fun close() { closes++ }
    }
    private val ready = """{"type":"ready","v":1}"""

    @Test fun readyGatesFirstFrameAndNeverReplaysPreReadyTouch() {
        var now = 0L
        val socket = FakeSocket()
        val channel = GamepadOwnerChannel(socket, { now })
        assertFalse(channel.onTouch(GamepadTouchModel.State(0, 0, true)))
        assertTrue(socket.frames.isEmpty())
        assertTrue(channel.onTick())
        assertTrue(channel.onServerMessage(ready))
        assertTrue(channel.isActive)
        assertEquals(0, socket.frames.single().getInt("buttons"))
        assertEquals(1, socket.frames.single().getInt("seq"))
        now = 1L
        assertTrue(channel.onTouch(GamepadTouchModel.State(20000, 0, true)))
        assertEquals(4096, socket.frames.last().getInt("buttons"))
        channel.close()
        assertTrue(channel.isClosed)
        assertEquals(0, socket.frames.last().getInt("buttons"))
        assertEquals(0, socket.frames.last().getInt("lx"))
        assertEquals(1, socket.closes)
        channel.close()
        assertEquals(1, socket.closes)
    }

    @Test fun invalidAndDuplicateReadyTerminateWithoutForwardingTouch() {
        for (invalid in listOf("{}", """{"v":2,"type":"ready"}""",
            """{"type":"ready","v":1,"token":"inject"}""",
            """{"v":"1","type":"ready"}""",
            " ".repeat(97), "not-json")) {
            val socket = FakeSocket()
            val channel = GamepadOwnerChannel(socket, { 0L })
            assertFalse(channel.onServerMessage(invalid))
            assertTrue(channel.isClosed)
            assertTrue(socket.frames.isEmpty())
            assertEquals(1, socket.closes)
        }
        val socket = FakeSocket()
        val channel = GamepadOwnerChannel(socket, { 0L })
        assertTrue(channel.onServerMessage(ready))
        assertFalse(channel.onServerMessage(ready))
        assertTrue(channel.isClosed)
        assertEquals(0, socket.frames.last().getInt("buttons"))
    }

    @Test fun handshakeDeadlineAndClockRegressionFailClosed() {
        var now = 0L
        val socket = FakeSocket()
        val channel = GamepadOwnerChannel(socket, { now }, handshakeTimeoutMs = 200)
        now = 201L
        assertFalse(channel.onTick())
        assertFalse(channel.onServerMessage(ready))
        assertEquals(1, socket.closes)

        now = 100L
        val rollback = FakeSocket()
        val second = GamepadOwnerChannel(rollback, { now })
        now = 99L
        assertFalse(second.onTick())
        assertTrue(second.isClosed)
        assertEquals(1, rollback.closes)
    }

    @Test fun activeHeartbeatAndNetworkFailureReturnNeutralAndBlockReuse() {
        var now = 0L
        val socket = FakeSocket()
        val channel = GamepadOwnerChannel(socket, { now })
        assertTrue(channel.onServerMessage(ready))
        now = 1L
        assertTrue(channel.onTouch(GamepadTouchModel.State(7000, 1000, true)))
        now = 41L
        assertTrue(channel.onTick())
        assertEquals(4096, socket.frames.last().getInt("buttons"))
        assertEquals(3, socket.frames.size) // initial neutral, press, heartbeat
        socket.allowSends = false
        now = 81L
        assertFalse(channel.onTick())
        assertTrue(channel.isClosed)
        assertEquals(1, socket.closes)
        assertFalse(channel.onTouch(GamepadTouchModel.State(a = true)))
        assertFalse(channel.onTick())
        assertEquals(0, socket.frames.last().getInt("buttons"))
    }

    @Test fun freshSessionMustHandshakeAgainAndHasNewSequence() {
        val old = FakeSocket()
        val first = GamepadOwnerChannel(old, { 0L })
        assertTrue(first.onServerMessage(ready))
        first.close()
        val socket = FakeSocket()
        val next = GamepadOwnerChannel(socket, { 10L })
        assertFalse(next.onTouch(GamepadTouchModel.State(a = true)))
        assertTrue(socket.frames.isEmpty())
        assertTrue(next.onServerMessage("""{"v":1,"type":"ready"}"""))
        assertEquals(1, socket.frames.single().getInt("seq"))
        assertEquals(0, socket.frames.single().getInt("buttons"))
    }

    @Test fun onlyTrustedLocalSameOriginMayDefineSocketEndpoint() {
        val ip = GamepadSocketTarget.fromTrustedPage(
            "http://192.168.1.22:8620", "http://192.168.1.22:8620/touchpad")
        assertEquals("http://192.168.1.22:8620", ip?.origin)
        assertEquals("ws://192.168.1.22:8620/gamepad", ip?.websocketUrl)
        val tls = GamepadSocketTarget.fromTrustedPage(
            "https://10.0.0.2:8620", "https://10.0.0.2:8620/")
        assertEquals("wss://10.0.0.2:8620/gamepad", tls?.websocketUrl)
        for (url in listOf("https://evil.example/", "http://192.168.1.23:8620/",
            "http://192.168.1.22:8621/", "http://192.168.1.22:8620.evil.invalid/")) {
            assertNull(GamepadSocketTarget.fromTrustedPage("http://192.168.1.22:8620", url))
        }
        assertNull(GamepadSocketTarget.fromTrustedPage(
            "https://outside.example", "https://outside.example"))
        assertNull(GamepadSocketTarget.fromTrustedPage(
            "http://192.168.1.22:8620/gamepad?secret=abc", "http://192.168.1.22:8620"))
    }
}
