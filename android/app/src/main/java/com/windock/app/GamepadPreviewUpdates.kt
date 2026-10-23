package com.windock.app

import android.app.Activity
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import org.json.JSONArray
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.Executor
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Preview-only manual update flow, separate from WinDock's LAN pairing.
 * No unattended APK install: the Android package installer has final control.
 */
internal object GamepadPreviewUpdates {
    private const val RELEASES = "https://api.github.com/repos/Farzansayeed/WinDock/releases?per_page=30"
    private const val APK = "WinDockGamepadPreview-Android.apk"
    private val VERSION_TAG = Regex("""^gamepad-v(\d+)\.(\d+)\.(\d+)-gamepad\.(\d+)-g[0-9a-f]{7}$""")
    private val HASH = Regex("""^sha256:[a-fA-F0-9]{64}$""")
    private val occupied = AtomicBoolean(false)

    internal data class Release(val version: String, val tag: String, val url: String,
                                val sha256: String, val bytes: Long)

    internal fun newest(json: String, installed: String): Release? {
        require(json.length <= 2_000_000)
        val installedNumber = parts(installed) ?: return null
        val listing = JSONArray(json)
        var best: Release? = null
        for (i in 0 until listing.length()) {
            val release = listing.optJSONObject(i) ?: continue
            if (release.optBoolean("draft", true) || !release.optBoolean("prerelease", false)) continue
            val tag = release.optString("tag_name")
            val match = VERSION_TAG.matchEntire(tag) ?: continue
            val numbers = match.groupValues.drop(1).mapNotNull { it.toLongOrNull() }
            if (numbers.size != 4 || compare(numbers, installedNumber) <= 0 ||
                (best != null && compare(numbers, parts(best.version)!!) <= 0)) continue
            val files = release.optJSONArray("assets") ?: continue
            for (j in 0 until files.length()) {
                val asset = files.optJSONObject(j) ?: continue
                if (asset.optString("name") != APK) continue
                val download = "https://github.com/Farzansayeed/WinDock/releases/download/" + tag + "/" + APK
                val digest = asset.optString("digest")
                val bytes = asset.optLong("size", -1L)
                if (asset.optString("browser_download_url") != download ||
                    !HASH.matches(digest) || bytes !in 100_000L..100_000_000L) continue
                best = Release(numbers.take(3).joinToString(".") + "-gamepad." + numbers[3],
                    tag, download, digest.substring(7).lowercase(), bytes)
                break
            }
        }
        return best
    }

    private fun parts(version: String): List<Long>? {
        val match = Regex("""^(\d+)\.(\d+)\.(\d+)-gamepad\.(\d+)$""").matchEntire(version) ?: return null
        val parsed = match.groupValues.drop(1).mapNotNull { it.toLongOrNull() }
        return parsed.takeIf { it.size == 4 }
    }

    private fun compare(a: List<Long>, b: List<Long>): Int {
        for (i in 0..3) if (a[i] != b[i]) return a[i].compareTo(b[i])
        return 0
    }

    private fun open(url: String): HttpURLConnection = (URL(url).openConnection() as HttpURLConnection).apply {
        connectTimeout = 12_000
        readTimeout = 35_000
        setRequestProperty("User-Agent", "WinDock-GamepadPreview-Android")
    }

    fun check(activity: Activity, executor: Executor) {
        if (!BuildConfig.APPLICATION_ID.endsWith(".gamepadpreview") ||
            !occupied.compareAndSet(false, true)) return
        executor.execute {
            try {
                val conn = open(RELEASES)
                val result = try {
                    if (conn.responseCode != 200 || conn.url.protocol != "https")
                        throw IOException("Could not read the HTTPS GitHub release list.")
                    val output = ByteArrayOutputStream()
                    conn.inputStream.use { input ->
                        val buffer = ByteArray(16384)
                        while (true) {
                            val n = input.read(buffer)
                            if (n < 0) break
                            if (output.size() + n > 2_000_000) throw IOException("Release list exceeds allowed size.")
                            output.write(buffer, 0, n)
                        }
                    }
                    newest(output.toString("UTF-8"), BuildConfig.VERSION_NAME)
                } finally { conn.disconnect() }
                activity.runOnUiThread {
                    if (activity.isFinishing || activity.isDestroyed) return@runOnUiThread
                    if (result == null) message(activity, "Gamepad Preview updates",
                        "You're up to date. Installed version: " + BuildConfig.VERSION_NAME)
                    else AlertDialog.Builder(activity).setTitle("Gamepad Preview update available")
                        .setMessage("Version " + result.version + " is available.\nInstalled: " +
                            BuildConfig.VERSION_NAME + "\n\nDownload and verify the APK, then ask Android to install it?")
                        .setNegativeButton(android.R.string.cancel, null)
                        .setPositiveButton("Download") { _, _ -> download(activity, executor, result) }
                        .show()
                }
            } catch (error: Exception) {
                activity.runOnUiThread {
                    if (!activity.isFinishing && !activity.isDestroyed)
                        message(activity, "Update check failed", error.message ?: "Check your internet access.")
                }
            } finally {
                occupied.set(false)
            }
        }
    }

    private fun download(activity: Activity, executor: Executor, release: Release) {
        if (!occupied.compareAndSet(false, true)) return
        val progress = AlertDialog.Builder(activity).setTitle("Verifying Gamepad Preview")
            .setMessage("Downloading the APK and checking its SHA-256. Nothing installs without your approval.")
            .setCancelable(false).create()
        progress.show()
        executor.execute {
            try {
                val dir = File(activity.cacheDir, "updates/" + release.tag).apply { mkdirs() }
                val apk = File(dir, APK)
                val staging = File(dir, APK + ".partial")
                try {
                    val conn = open(release.url)
                    try {
                        if (conn.responseCode != 200 || conn.url.protocol != "https")
                            throw IOException("GitHub HTTPS APK download failed.")
                        val sha = MessageDigest.getInstance("SHA-256")
                        var length = 0L
                        conn.inputStream.use { input ->
                            staging.outputStream().buffered().use { output ->
                                val buffer = ByteArray(65536)
                                while (true) {
                                    val n = input.read(buffer)
                                    if (n < 0) break
                                    length += n
                                    if (length > release.bytes) throw IOException("APK size limit exceeded.")
                                    output.write(buffer, 0, n)
                                    sha.update(buffer, 0, n)
                                }
                            }
                        }
                        val actualHash = sha.digest().joinToString("") { "%02x".format(it) }
                        if (length != release.bytes || actualHash != release.sha256)
                            throw IOException("SHA-256 or file size did not match the GitHub release.")
                    } finally { conn.disconnect() }
                    if (apk.exists() && !apk.delete()) throw IOException("Cannot replace cached APK.")
                    if (!staging.renameTo(apk)) throw IOException("Cannot stage downloaded APK.")
                } finally { staging.delete() }

                @Suppress("DEPRECATION")
                val packageInfo = activity.packageManager.getPackageArchiveInfo(apk.absolutePath, 0)
                if (packageInfo?.packageName != activity.packageName)
                    throw IOException("APK package name does not match Gamepad Preview.")

                activity.runOnUiThread {
                    progress.dismiss()
                    if (activity.isFinishing || activity.isDestroyed) return@runOnUiThread
                    AlertDialog.Builder(activity).setTitle("Verified APK ready")
                        .setMessage("Gamepad Preview " + release.version +
                            " passed checksum verification.\n\nAndroid will ask you to approve installation. " +
                            "Existing previews may have different debug signing keys, causing an in-place update " +
                            "to fail until consistent signing is set up.")
                        .setNegativeButton("Later", null)
                        .setPositiveButton("Install") { _, _ -> install(activity, apk) }.show()
                }
            } catch (error: Exception) {
                activity.runOnUiThread {
                    progress.dismiss()
                    if (!activity.isFinishing && !activity.isDestroyed)
                        message(activity, "Update not installed", error.message ?: "Verification failed.")
                }
            } finally { occupied.set(false) }
        }
    }

    private fun install(activity: Activity, file: File) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !activity.packageManager.canRequestPackageInstalls()) {
            AlertDialog.Builder(activity).setTitle("Android install permission")
                .setMessage("Allow WinDock Gamepad Preview to request app installs, then check for updates again.")
                .setNegativeButton(android.R.string.cancel, null)
                .setPositiveButton("Open settings") { _, _ ->
                    activity.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:" + activity.packageName)))
                }.show()
            return
        }
        try {
            val uri = FileProvider.getUriForFile(activity, activity.packageName + ".updates", file)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            activity.startActivity(intent)
        } catch (_: ActivityNotFoundException) {
            message(activity, "Android installer unavailable", "Open the downloaded release manually.")
        }
    }

    private fun message(activity: Activity, title: String, body: String) {
        AlertDialog.Builder(activity).setTitle(title).setMessage(body)
            .setPositiveButton(android.R.string.ok, null).show()
    }
}
