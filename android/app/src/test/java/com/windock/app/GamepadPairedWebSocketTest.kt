package com.windock.app

import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import java.util.concurrent.CountDownLatch
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.TimeUnit

/** Driver-free real loopback WebSocket; no physical gamepad or PIN bypass. */
class GamepadPairedWebSocketTest {
    @Test fun serverTimeoutIsReportedOnceWithoutRawWebSocketReasons() {
        val server = MockWebServer()
        val statuses = CopyOnWriteArrayList<String>()
        val gotNeutral = CountDownLatch(1)
        val closed = CountDownLatch(1)
        server.enqueue(MockResponse().withWebSocketUpgrade(object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                ws.send("""{"type":"ready","v":1}""")
            }
            override fun onMessage(ws: WebSocket, text: String) {
                gotNeutral.countDown()
                ws.close(1008, "heartbeat-timeout")
            }
            override fun onClosing(ws: WebSocket, code: Int, reason: String) {
                ws.close(code, null)
            }
            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                closed.countDown()
            }
        }))
        server.start()
        try {
            val origin = "http://127.0.0.1:" + server.port
            val target = GamepadSocketTarget.fromTrustedPage(origin, origin + "/touchpad")!!
            val session = GamepadPairedWebSocket.begin(
                target, "windock_session=" + "b".repeat(43), { statuses.add(it) })!!
            assertNotNull(server.takeRequest(3, TimeUnit.SECONDS))
            assertTrue("neutral sent after ready", gotNeutral.await(3, TimeUnit.SECONDS))
            assertTrue("close handshake", closed.await(3, TimeUnit.SECONDS))
            val until = System.nanoTime() + TimeUnit.SECONDS.toNanos(2)
            while (!statuses.contains("lab-pc-heartbeat-timeout") && System.nanoTime() < until)
                Thread.sleep(5)
            assertTrue(statuses.toString(), statuses.contains("lab-pc-heartbeat-timeout"))
            assertEquals("terminal reported once", 1,
                statuses.count { it.startsWith("lab-pc-") ||
                    it == "lab-network-failure" || it == "lab-rejected" ||
                    it == "lab-phone-sender-stopped" })
            assertFalse(session.touch(GamepadTouchModel.State(a = true)))
        } finally { server.shutdown() }
    }

    @Test fun forwardsOnlyOneWellFormedOriginalSessionCookie() {
        val t = "b".repeat(43)
        assertEquals("windock_session=" + t,
            GamepadSessionCookie.extract("other=private; windock_session=" + t))
        assertNull(GamepadSessionCookie.extract("other=private"))
        assertNull(GamepadSessionCookie.extract("windock_session=short"))
        assertNull(GamepadSessionCookie.extract("windock_session=" + t + "; windock_session=" + t))
        assertNull(GamepadSessionCookie.extract("windock_session=" + t + "\nHeader: injected"))
        assertNull(GamepadSessionCookie.extract(("windock_session=" + t + ";").repeat(100)))
    }

    @Test fun existingCookieAndOriginDeliverNeutralButtonAndFinalNeutral() {
        val server=MockWebServer()
        val states=CopyOnWriteArrayList<JSONObject>()
        val neutral=CountDownLatch(1)
        val idleHeartbeats=CountDownLatch(3)
        val pressed=CountDownLatch(1)
        val released=CountDownLatch(1)
        val closed=CountDownLatch(1)
        server.enqueue(MockResponse().withWebSocketUpgrade(object:WebSocketListener(){
            override fun onOpen(ws:WebSocket,response:Response) {
                ws.send("""{"type":"ready","v":1}""")
            }
            override fun onClosing(webSocket:WebSocket, code:Int, reason:String) {
                webSocket.close(code, null)
            }
            override fun onClosed(webSocket:WebSocket, code:Int, reason:String) {
                closed.countDown()
            }
            override fun onMessage(ws:WebSocket,text:String) {
                val s=JSONObject(text)
                states.add(s)
                if(states.size==1 && s.getInt("buttons")==0) neutral.countDown()
                if(s.getInt("buttons")==0 && pressed.count>0L) idleHeartbeats.countDown()
                if(s.getInt("buttons")==4096) pressed.countDown()
                if(pressed.count==0L && s.getInt("buttons")==0) released.countDown()
            }
        }))
        server.start()
        try {
            val origin="http://127.0.0.1:"+server.port
            val target=GamepadSocketTarget.fromTrustedPage(origin,origin+"/touchpad")
            assertNotNull(target)
            val statuses=CopyOnWriteArrayList<String>()
            val session=GamepadPairedWebSocket.begin(target!!,
                "other=not-sent; windock_session="+"b".repeat(43),{statuses.add(it)})
            assertNotNull(session)
            val req=server.takeRequest(3,TimeUnit.SECONDS)
            assertNotNull(req)
            assertEquals(origin,req!!.getHeader("Origin"))
            assertEquals("windock_session="+"b".repeat(43),req.getHeader("Cookie"))
            assertTrue("initial neutral",neutral.await(3,TimeUnit.SECONDS))
            val timeout = System.nanoTime() + TimeUnit.SECONDS.toNanos(3)
            while (!statuses.contains("lab-ready") && System.nanoTime() < timeout)
                Thread.sleep(5)
            assertTrue("ACK consumed before A press", statuses.contains("lab-ready"))
            assertTrue("idle heartbeats independent of any View", idleHeartbeats.await(1500,TimeUnit.MILLISECONDS))
            assertTrue(session!!.touch(GamepadTouchModel.State(10000,0,true)))
            assertTrue("A press reaches fake sink",pressed.await(3,TimeUnit.SECONDS))
            session.stop()
            assertTrue("normal close sends neutral",released.await(3,TimeUnit.SECONDS))
            assertEquals(0,states.last().getInt("buttons"))
            assertFalse(session.touch(GamepadTouchModel.State(a=true)))
            assertTrue("WebSocket close handshake completes",closed.await(3,TimeUnit.SECONDS))
        } finally { server.shutdown() }
    }
}
