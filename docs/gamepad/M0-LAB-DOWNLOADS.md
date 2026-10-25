# WinDock M0 FAKE LAB — downloaded Windows ZIP + Android APK

> **CURRENT VERSION NOTICE (2026-10-25):** For the next test, use only matched private GitHub Actions artifact `M0-FAKE-LAB-v4-matched-downloads` from [run #40221419485](https://github.com/Farzansayeed/WinDock/actions/runs/40221419485), source `3a5b1a3d1736503d192347fd3d567027f5d3e988`, CI [#40221419569](https://github.com/Farzansayeed/WinDock/actions/runs/40221419569) PASS. Contains `WinDock-Gamepad-M0-LAB-v4-Windows-x64.zip` + `WinDock-Gamepad-M0-LAB-v4-Android.apk` (plus checksums/BUILD-INFO), expires 2026-11-08 18:31 UTC. **Not a GitHub Release.** The below v1/source-build instructions are HISTORICAL and do not identify v4 downloads. No user testing/install tonight; future owner steps explained **in chat** by next assistant. The v3 phone test FAILED, v4 phone test PENDING, no Xbox/driver. Read [active handoff](HANDOFF-2026-10-26-M0-FAILURE.md).



**One-off owner-requested separate debug lab**, source branch `feature/universal-gamepad`. It is a **FAKE** controller receiver. It cannot create a virtual Xbox/XInput controller or control games. Production `/gamepad` stays disabled. No HIDMaestro, driver, system certificate, elevation, licence or security bypass.

## Before downloading

Open the [matching one-off prerelease](https://github.com/Farzansayeed/WinDock/releases) tagged `gamepad-m0-fake-lab-g<SOURCE_SHA>` and confirm its release assets:
- `WinDock-Gamepad-M0-LAB-Windows-x64.zip` — portable Windows private receiver including Node executable, .NET 8 **self-contained fake child**, necessary JS and npm dependencies.
- `WinDock-Gamepad-M0-LAB-Android.apk` — independently installed Android development app, debug-signed.
- `SHA256SUMS.txt` (both files), `BUILD-INFO.txt` (same exact source SHA), `README-LAB.md`.

Do **not** use the older signed Gamepad Preview v46 APK or Windows Preview installer for this fake-lab test: they do not contain current M0 functionality. This lab does **not** update, overwrite or uninstall the regular WinDock or signed Gamepad Preview.

## Step 1 — Windows PC (x64 Windows 10/11)

1. Download both the ZIP and `SHA256SUMS.txt`. In non-admin PowerShell in Downloads, run:
   `Get-FileHash -Algorithm SHA256 .\WinDock-Gamepad-M0-LAB-Windows-x64.zip`
   Compare with the **matching ZIP line** in `SHA256SUMS.txt`. If different, stop.
2. Right-click the ZIP, **Extract All**. Open the extracted `WinDock-Gamepad-M0-LAB` folder.
3. Quit any regular or Preview WinDock host in the system tray to free TCP port **8620**. They remain installed.
4. Connect PC and phone to the same **trusted private Wi-Fi**, not a guest network. Open a normal Command Prompt and run `ipconfig`. Find the Windows PC's private IPv4 for the connected Wi-Fi adapter (typically `192.168.x.x`, `10.x.x.x`, or `172.16–31.x.x`). Do not share it publicly.
5. In the extracted Windows lab folder, run `Start-WinDock-LAB.cmd YOUR_PC_PRIVATE_IPV4`, for example `Start-WinDock-LAB.cmd 192.168.1.20` (**example address only**). The script runs only after you explicitly start it; it prints a private URL and pairing PIN in the PC terminal. The bundled app runs as your ordinary user; do not choose **Run as administrator**. No Windows system change or installed driver.
6. If Windows Defender Firewall shows a prompt, permit only if the app is recognized, on your **Private network**; never enable Public networks or turn the firewall off. If SmartScreen, antivirus or organizational policy blocks the executable, **STOP and report**; do not bypass the protection. The ZIP is a developer build, not Microsoft-signed.

## Step 2 — Android phone

1. Download the **matching** Android APK and verify its SHA256 against `SHA256SUMS.txt` when possible.
2. Install by opening it in Android Files. Allow install from that Files app if needed, following Android's normal prompt; do not disable Play Protect or other system protections. If Android blocks the APK as unsafe, **stop and report** rather than overriding security protection.
3. Confirm a **separate** app named `WinDock Gamepad LAB`. Existing regular WinDock and `WinDock Gamepad Preview` must still be installed and unchanged. Cancel if Android proposes replacing either one.
4. Open **WinDock Gamepad LAB**, connect to **the exact private http URL displayed on Windows**, pair with the Windows console PIN through the normal UI. Never send the PIN or cookie to anyone.
5. Enter **Touch & sign → Gamepad**, deliberately tap **Paired LAB (fake only)**. Expect **PAIRED FAKE RECEIVER — NO XBOX** only after native fake receiver readiness. Normal Gamepad UI by itself is still local-only.

## Step 3 — Confirm REAL phone-to-FAKE Windows input

1. Press and release A. Expect **FAKE A press/release** transition messages in the Windows terminal.
2. Move and then recenter the left stick. Expect **FAKE left stick moved/centered** transitions. Console notices stop after a safe cap of 16; per-frame analog/controller values, PINs and IP addresses are not logged.
3. Switch Gamepad → Touchpad or background/close the Android app. Expect no held input in fake sink. Do not expect any new Xbox controller to appear in Windows or games.
4. In the Windows terminal press Ctrl+C. Expect fake reports/counters plus host software p50/p95/p99/max in milliseconds. These are **local Node decode/validate/sink timings**, NOT network RTT, one-way touch-to-PC latency, or gameplay timing. If there were no accepted reports, the latency values can show `n/a`.
5. Close the Windows terminal. No Windows host is auto-started afterward.

**Pass gate:** test only on a trusted LAN, same release commit on both devices, and only after release build/CI succeeds. Phone-to-Windows field pass requires your own observations. Previously accepted physical XInput 0/4 baseline, Windows Preview install, Android v25 and v40 audit tests do not need repeating. The native fake watchdog **remains 180 ms** and cannot be loosened to make a test pass.

**If blocked:** report the step and what the UI/terminal showed, without sharing PIN, cookies, tokens, internal network address or sensitive logs. Do not install a real controller driver, add certificates, elevate, or disable security checks to proceed.
