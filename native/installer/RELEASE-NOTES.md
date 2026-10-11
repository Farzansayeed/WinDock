## WinDock 0.2.0-preview.1

Your phone is now a touchpad, keyboard and signature pad for your Windows PC.

- **Touchpad:** a full-screen dark grid with blue touch feedback, adjustable speed, click/drag controls, two-finger scrolling and pinch zoom in compatible PC apps.
- **Keyboard:** use the normal Android keyboard, including emoji. Supported PC text fields open it automatically; a keyboard button is available as a fallback.
- **Signatures:** draw in black or blue, save transparent PNGs to Pictures / WinDock / Signatures, or paste into a PC app that accepts images.
- **Icons:** real app icons now recover after temporary loading failures.
- **Website:** try the updated interactive demo and browse the new version history.

### Install or update

Download **WinDockSetup.exe** for Windows 10/11 x64 and
**WinDock-android-debug.apk** for Android 7.0+. Update both devices.
Quit WinDock from the PC tray before running the installer. Your dock settings
are preserved. Keep both devices on the same trusted network and pair using
the PIN in the Windows tray.

**Updating the September 18 public Android preview:** it used a different debug
signing key. Uninstall that APK first, install this one, then pair again.
The recent local keyboard test APK uses the same key as this release and can
update directly. Your pinned dock remains on the PC.

### Preview limitations

The Windows installer is unsigned and the Android APK is debug-signed. Keyboard
focus detection depends on the PC app; composed words arrive when the Android
keyboard commits them. Signature insertion requires image-paste support and
also saves a PNG. Windows permissions still apply to remote input. Screen
recordings are video only. iOS is planned; macOS is not supported.

SHA256SUMS.txt contains both download checksums. The full history is in
[CHANGELOG.md](https://github.com/aliihsaad/WinDock/blob/main/CHANGELOG.md).
