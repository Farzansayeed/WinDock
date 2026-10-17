## WinDock 0.2.1-preview.1

Playing information now keeps up automatically, and the Windows tray can check
for future updates.

- **Now playing:** track, artist and playback changes update every two seconds
  while connected and visible. Polling pauses in the background and resumes when
  you return. Thanks @Peter-KIbe for reporting [#1](https://github.com/aliihsaad/WinDock/issues/1).
- **Updates:** choose **Check for updates** in the Windows tray. WinDock also
  checks at startup and notifies you when a newer release is available. Click the
  notification or download menu item to view the release. Installation is manual.
- **Reliability:** transient failures recover automatically, slow media requests
  do not pile up, and unchanged playback controls keep keyboard focus.

### Update instructions

1. Quit WinDock using its Windows tray menu.
2. Download and run **WinDockSetup.exe**. Your dock settings are preserved.
3. Start WinDock, then disconnect/reconnect your Android app to load the updated
   dock. Pair again with the tray PIN if prompted.

**No Android APK update is required.** The APK included here is byte-for-byte the
existing 0.2.0-preview.1 Android build (version code 3), included for new users.
Existing Windows users must install this release manually once; earlier versions
cannot check for updates. Windows notification settings may suppress a startup
notification, so **Check for updates** is always available in the tray.

### Verification and preview status

The media fix passed browser and Android emulator WebView regressions without
Refresh clicks, including pause/resume, ended playback, and background return.
The release build checks update detection, native input, app tests, and installer
installation, launch, upgrade and uninstall.

Windows is unsigned and Android is debug-signed. The September 18 Android preview
used a different signing key and must be uninstalled before installing the newer
APK. iOS remains in development with no installable public release.

Download hashes are in **SHA256SUMS.txt**. See the full
[version history](https://github.com/aliihsaad/WinDock/blob/main/CHANGELOG.md).
