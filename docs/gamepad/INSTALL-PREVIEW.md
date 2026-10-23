# Install WinDock Gamepad development builds

**Current state:** The fork has a Touch & sign Gamepad UI preview, but NO playable virtual Xbox controller yet. These files are experimental test builds.

## Latest confirmed development release (at last documentation review)

The latest version **confirmed published and fully built** at this review was [WinDock Gamepad Preview 0.2.3-gamepad.5](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.5-g0a81c22), which includes the native Android **local-only one-stick+A input preview**. It has Windows installer + Android APK and checksums. Newer code may be compiling; open the [Releases page](https://github.com/Farzansayeed/WinDock/releases) to see if a later numbered version passed and was actually published.

## First published development release

[WinDock Gamepad Preview 0.2.3-gamepad.1](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.1-gc631611) was confirmed published with both installers, build information and checksums following a successful Actions run. **Check the fork Releases page for any newer successful versions before downloading.** This version contains the Gamepad UI preview, not working gamepad support. Later releases cannot be assumed successful until checked.

## Update without manually visiting Downloads

**Windows Preview:** Right-click Preview tray → Check for Gamepad Preview updates; when a newer fork release exists, approve download, SHA-256 verification and installer launch. Windows may prompt about unsigned installer; original WinDock remains separate.

**Android Preview:** Open Phone options → Check for Gamepad Preview updates; approve download; Android's system package installer still requires confirmation. Smooth in-place upgrades need one stable signing key across preview APKs. See [UPDATES.md](UPDATES.md) for key setup and the mandatory test checklist. Source is committed, real-device updater behavior not yet verified.

## Download from your own GitHub fork

- **Releases:** https://github.com/Farzansayeed/WinDock/releases
- **Automated build status / build artifacts:** https://github.com/Farzansayeed/WinDock/actions/workflows/gamepad-preview.yml
- **Branch:** https://github.com/Farzansayeed/WinDock/tree/feature/universal-gamepad

When a successful Gamepad Preview release exists, download **WinDockGamepadPreviewSetup.exe** for Windows 10/11 x64 and **WinDockGamepadPreview-Android.apk** for Android 7+. Verify both against **SHA256SUMS.txt**; **BUILD-INFO.txt** identifies the exact source commit and build number.

**If no newer Gamepad Preview release appears, the latest previously successful release remains available.** Builds can pass while **release publishing fails** (GitHub may return HTTP 403). In that case open the specific build [Actions run](https://github.com/Farzansayeed/WinDock/actions/workflows/gamepad-preview.yml) and download both completed **gamepad-windows-preview** and **gamepad-android-preview** artifact ZIPs separately; they are valid build outputs only if their respective jobs passed, but are NOT a published release. Do not mix mismatched run versions. In Actions, select "Gamepad fork preview downloads"; enable GitHub Actions if prompted. Click "Run workflow", choose branch "feature/universal-gamepad", and run. A workflow must finish successfully to publish a GitHub prerelease. You can also download its Windows and Android build artifacts from the workflow run page (GitHub sign-in required); artifacts are ZIP wrappers and can expire.

## Install on Windows

1. Quit **regular WinDock** from the system tray first. Both installations currently serve port **8620**, so running them together will cause a conflict.
2. Run **WinDockGamepadPreviewSetup.exe**. This build uses a separate installer ID, Start menu shortcut, install directory and uninstall entry. It does NOT replace your original WinDock installation.
3. The preview host uses separate dock config: **%APPDATA%\windock-gamepad-preview\config.json**. Your regular WinDock dock remains at its original location.
4. Find **WinDock Gamepad Preview** in your Start menu; open its system tray icon and choose **Show connection info** for its pairing PIN.
5. The Windows preview installer is **unsigned**. Read Windows publisher warnings, confirm you downloaded from your own fork, and check the SHA256 hash.

The fork preview deliberately does **not** check for or install updates from the original project's feed. Check this fork's Releases page for preview updates, quit the preview host, and run the newer installer. The visible tray version is based on the GitHub build number; the installer keeps the numerical base version for Inno Setup compatibility.

## Install on Android

1. Transfer **WinDockGamepadPreview-Android.apk** to your phone and open it from Files/Downloads.
2. If Android asks, grant permission to install apps from that file manager.
3. The preview package ID is **com.windock.app.gamepadpreview**, so the regular WinDock Android app stays installed. If the two app icons appear identical, use Android Settings -> Apps to distinguish by package/app details.
4. **Important:** The APK is debug-signed. GitHub's fresh build runners may use different signing keys. If installing a newer preview says the app conflicts with an existing install, uninstall ONLY **the old Gamepad Preview** Android app and install the new one. This resets the preview app's settings, not the regular app's settings.
5. Open the preview app, connect over local Wi-Fi or USB tethering to the **preview** PC host, and enter the PIN from that preview PC tray menu.

Inside the dock, open **Touch & sign** to try the **Gamepad UI-only preview** and switch directly back to Touchpad. No game currently receives Gamepad input from it, and **no virtual controller driver is bundled**.

## What version am I running?

Every **successful source-build run** gets its own numbered prerelease. The naming format is:

- GitHub tag: **gamepad-v0.2.3-gamepad.RUN-gCOMMIT** (example shape only; actual link exists only after a successful build)
- Windows tray version and Android versionName: **0.2.3-gamepad.RUN**
- Android versionCode: **100000 + RUN**
- Release files: two platform installers, **SHA256SUMS.txt** and **BUILD-INFO.txt**.

The base version comes from the fork's package.json, so later changes to the project version are reflected without editing the workflow. Git SHA identifies the precise source even when multiple preview builds exist.

**On every code push** to feature/universal-gamepad, the preview workflow runs for changed app, test, packaging, or workflow files. Documentation-only pushes do not rebuild packages. **A prerelease is created only when tests, Windows installer smoke testing and Android build/lint all pass.** An unsuccessful workflow leaves the previous release untouched; inspect Actions to see why. These are development prereleases, not tested stable versions.

The original upstream project's downloads and release notes remain unchanged. Never confuse https://github.com/aliihsaad/WinDock/releases with the fork's previews.

## Future upgrades

- A reproducible or securely stored Android **release signing key** is required for seamless installation over older preview builds. Never commit a private signing key to the public GitHub repository.
- Before announcing a stable version: actual Windows and Android installs, pairing, touchpad/signature regression, signed driver decision, Xbox/XInput proof, latency measurements, and upgrade/uninstall tests must all pass.
- **P8 Touchpad latency optimization** stays deferred until the functional Gamepad is finished.

Current progress: https://github.com/Farzansayeed/WinDock/blob/feature/universal-gamepad/docs/gamepad/PROGRESS.md
