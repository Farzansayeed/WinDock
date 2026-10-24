package com.windock.app

import java.net.URI

/**
 * Authenticated-session destination policy, not a socket implementation.
 * Construct this only from a currently trusted WinDock WebView origin. The
 * future caller must obtain an existing paired session cookie from WebView's
 * cookie store FOR THIS ORIGIN; never send a PIN or create an unpaired bypass.
 */
internal data class GamepadSocketTarget(val origin: String, val websocketUrl: String) {
    companion object {
        fun fromTrustedPage(endpoint: String?, visiblePageUrl: String?): GamepadSocketTarget? {
            val trusted = EndpointPolicy.normalize(endpoint) ?: return null
            if (!EndpointPolicy.allowsRequest(trusted, visiblePageUrl)) return null
            return try {
                val base = URI(trusted)
                val wsScheme = if (base.scheme == "https") "wss" else "ws"
                val ws = URI(wsScheme, null, base.host, base.port, "/gamepad", null, null)
                GamepadSocketTarget(base.toASCIIString(), ws.toASCIIString())
            } catch (_: Exception) { null }
        }
    }
}
