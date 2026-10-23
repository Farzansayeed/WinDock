package com.windock.app

import org.junit.Assert.*
import org.junit.Test

class GamepadPreviewUpdatesTest {
    private fun release(tag: String, hash: String = "sha256:" + "a".repeat(64),
        draft: Boolean = false, name: String = "WinDockGamepadPreview-Android.apk"): String {
        val url = "https://github.com/Farzansayeed/WinDock/releases/download/" + tag + "/" + name
        return """{"tag_name":"$tag","draft":$draft,"prerelease":true,
            "assets":[{"name":"$name","digest":"$hash","size":2107645,"browser_download_url":"$url"}]}"""
    }
    @Test fun selectsNumericNextBuildAndRejectsRollback() {
        val old = release("gamepad-v0.2.3-gamepad.5-g0a81c22")
        val current = release("gamepad-v0.2.3-gamepad.6-g0123456")
        val next = GamepadPreviewUpdates.newest("[" + old + "," + current + "]", "0.2.3-gamepad.5")
        assertEquals("0.2.3-gamepad.6", next?.version)
        assertEquals("a".repeat(64), next?.sha256)
        assertNull(GamepadPreviewUpdates.newest("[" + old + "]", "0.2.3-gamepad.6"))
    }
    @Test fun rejectsWrongDraftDigestAssetAndTag() {
        val t = "gamepad-v0.2.3-gamepad.6-g0123456"
        assertNull(GamepadPreviewUpdates.newest("[" + release(t, draft = true) + "]", "0.2.3-gamepad.5"))
        assertNull(GamepadPreviewUpdates.newest("[" + release(t, hash = "sha256:wrong") + "]", "0.2.3-gamepad.5"))
        assertNull(GamepadPreviewUpdates.newest("[" + release(t, name = "other.apk") + "]", "0.2.3-gamepad.5"))
        assertNull(GamepadPreviewUpdates.newest("[" + release("v0.2.3-gamepad.6") + "]", "0.2.3-gamepad.5"))
    }
}
