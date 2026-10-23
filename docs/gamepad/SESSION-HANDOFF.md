# WinDock Universal Gamepad — CURRENT CHAT / AGENT HANDOFF

**Snapshot checked:** 2026-10-23. **Use this to resume work, but re-check live GitHub HEAD, Releases and Actions before making current-status claims.**

## Read-first workflow for the next chat

1. The user's repository is https://github.com/Farzansayeed/WinDock and ALL coding is on branch **feature/universal-gamepad**. Do NOT push fork main, edit original upstream aliihsaad/WinDock, or open upstream PRs without explicit request.
2. Read root **AGENTS.md** and this document, then **PROGRESS.md** (single live checklist), **WORKLOG.md** (dated evidence), **UPDATES.md** (signing/update rules), **P2-DRIVER-FEASIBILITY.md**, **AUDIT.md** and **REQUIREMENTS-v2.md** as needed. Older text can describe past phases; do not misread it as a fresh status.
3. Inspect latest branch SHA, latest successful Actions runs and GitHub published NON-DRAFT prereleases. Compare numeric version/build identifiers: GitHub API order is not reliably version order. Verify release tag/source SHA and installer/APK + BUILD-INFO.txt, SHA256SUMS.txt and SIGNING-INFO.txt.
4. Continue actual coding/testing where possible, rather than restarting planning. On EVERY meaningful code batch, update BOTH **docs/gamepad/PROGRESS.md** and **docs/gamepad/WORKLOG.md** in the SAME commit, recording exact tests, failures, untested device work, release links, blockers and next concrete action. Update this handoff and AGENTS.md when major milestones/decisions change.
5. Never ask the user to repeat existing product requirements or send the private JKS, passwords, base64 signing secret, pairing PINs or GitHub tokens. User's secrets are already configured and CI-proven. Keep offline backup ownership with the user.
6. Distinguish SOURCE CODED, MOCK/UNIT TESTS PASSED, CI BUILT, GITHUB RELEASE PUBLISHED, REAL PHONE/WINDOWS TESTED and GENUINE PC GAMEPAD FUNCTIONAL. These are NOT interchangeable.

## Verified exact release and test status

- On 2026-10-23, latest verified permanently-signed **experimental preview**: **WinDock Gamepad Preview 0.2.3-gamepad.11**, tag **gamepad-v0.2.3-gamepad.11-g175942e**, source commit **175942e...**. https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e
- Windows installer, Android Preview APK, BUILD-INFO.txt, SHA256SUMS.txt and public **SIGNING-INFO.txt** are published.
- GitHub preview workflow #39998130556 (https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) succeeded: Android build/JVM tests/lint, presence of four private signing secrets, APK public signing certificate matching configured keystore, Windows build/installer smoke and publication. CI #39998130774 and subsequent docs CI #39998883980 passed.
- **The Android owner's four signing secrets are operationally validated**, not inspected: WINDOCK_PREVIEW_KEYSTORE_BASE64, WINDOCK_PREVIEW_STORE_PASSWORD, WINDOCK_PREVIEW_KEY_ALIAS, WINDOCK_PREVIEW_KEY_PASSWORD. Never display or ask for private values or keystore. SIGNING-INFO contains only a PUBLIC certificate fingerprint.
- Release v11 is STILL **UI and local gamepad input preview only**, NOT a functional Windows Xbox controller. No real Android/Windows installations, upgrades, XInput device proof, game test, or latency benchmark was performed by this agent. Never imply the build proves otherwise.
- Earlier per-run-debug APKs may have a DIFFERENT signature. User may need to uninstall ONLY an old **Gamepad Preview** APK once to move to permanent-key v11. Regular WinDock must remain untouched. Need a SECOND signed prerelease with identical public SIGNING-INFO certificate fingerprint and an actual phone in-place update over v11 (preserving preview settings) before marking smooth updates proven.
- Windows Preview EXE is unsigned and may show SmartScreen. Windows Preview and original WinDock use the same local port **8620** and cannot run simultaneously; their installer identity and config are otherwise separate. Android Preview application ID suffix is **.gamepadpreview**.

## Scope and non-negotiable user decisions

- Gamepad is THIRD mode **inside Touch & sign**, next to Touchpad and Signature; direct one-tap Gamepad ↔ Touchpad switch, NOT separate dashboard tile.
- Existing WinDock functions MUST remain intact: touchpad, signature, keyboard/IME, capture, recording, discovery, PIN/cookie pairing, media controls and other supported OS paths.
- Native **Kotlin Android existing companion APK**, real virtual Xbox/XInput Windows gamepad, not WASD/keyboard emulation. Full v1 control groups: optional 0, 1 or 2 true analog sticks (single stick assignable to left/right), D-pad, ABXY, LB/RB, analog LT/RT, Menu/View, optional L3/R3. Independently visible, draggable/resizable groups; locally stored profiles/presets.
- **No rumble/haptics and no gyro in v1**. No cloud/account requirement for gameplay; local Wi-Fi or ordinary USB tether only, NO ADB. GitHub internet for software update checks is separate from gameplay.
- All inputs MUST neutralize on release, cancel, background, screen/mode exit, disconnect, stale/replayed packets, phone/PC process crash, driver loss. PC timer-based stale-state watchdog must actually run in native receiver; tested JS/C# models alone do NOT protect a real device.
- No unapproved Windows elevated driver installation, certificate trust-store changes, signature-enforcement bypass or silently elevated Node host.

## What has been written vs what works

- **P0:** Branch, plans, audit, UI screenshots and source map created.
- **P1:** Existing Touch & sign Gamepad preview and quick mode switching coded in public/index.html, input-pad.js and styles; DOM/mock/CI checks exist. Hands-on phone UX regression not reported.
- **P2 CRITICAL BLOCKER:** Windows native/gamepad-probe has read-only XInputGetState diagnostic coded and built in CI, but NO real driver created/installed/tested. HIDMaestro currently involves .NET 10 plus elevated/driver trust implications vs WinDock .NET 8; libvirtualhid Windows driver needs separate license; ViGEmBus is retired. No driver has been chosen.
- **P3 PARTIAL:** Android GamepadTouchModel.kt + GamepadTouchView.kt inside MainActivity.kt is a native LOCAL left-stick+A finger-ID multitouch preview, with cancellation/neutralization and JVM tests. Does NOT send PC gamepad frames. Full optional controls, role mapping, editor, presets and real-phone usability not done.
- **P4 PARTIAL:** src/gamepad/protocol.js and native/gamepad-tests/GamepadState.cs implement strict bounded snapshot validation and JS/C# fail-neutral session MODELS, with CI tests. NO persistent native device service, real watchdog or virtual XInput mapping.
- **P5/VS1 NOT DONE:** No authorized Android↔Windows gamepad session/control plane or genuine full-state transport. Preserve existing paired WebSocket/mouse path; use separate gamepad capability/ownership/auth checks and measure existing persistent-helper WS baseline BEFORE considering authenticated UDP.
- **P6 NOT DONE:** Actual supported games, joy.cpl + XInput tester, packet-loss/stuck-button cases, phone/Windows hardware, p50/p95/p99 latency and battery tests.
- **P7 PARTIAL:** Fork-specific Windows + Android Preview installer/APK and GitHub prerelease pipeline; consent-based Check for updates, SHA-256 verification and OS installer handoff, stable Android keystore proof v11. Real phone/PC update and smooth-version migration remain unverified. NO gamepad driver packaged.
- **P8 DEFERRED:** Improve existing Touchpad latency only AFTER full Gamepad v1 including P7 physically tested/released.

## Source/code/test map

- Android Kotlin/WebView trust: android/app/src/main/java/com/windock/app/MainActivity.kt
- Native local input: GamepadTouchModel.kt, GamepadTouchView.kt, GamepadTouchModelTest.kt under Android main/test Kotlin package.
- Input UI: public/index.html, public/input-pad.js, public/style.css, public/sw.js; scripts/verify-gamepad-ui.mjs and scripts/verify-pwa.mjs.
- Existing pairing/host: server.js, src/auth.js, src/input-hub.js, src/platform/input.js, src/platform/windows.js; Windows C# native/win/Program.cs and native/win/Touchpad.cs. **Do not break existing mouse/input protocol.**
- Neutral/protocol models: src/gamepad/protocol.js, scripts/verify-gamepad-protocol.mjs, native/gamepad-tests/WinDock.GamepadTests.csproj + GamepadState.cs + Program.cs.
- Read-only XInput scan: native/gamepad-probe/WinDock.GamepadProbe.csproj + Program.cs + README.md. It cannot create a controller.
- Windows Preview updater: native/tray/PreviewUpdates.cs + Program.cs; native/update-tests/Program.cs; installer/native packaging scripts.
- Android updater: android/app/src/main/java/com/windock/app/GamepadPreviewUpdates.kt, PhoneOptions.kt; android/app/src/debug/AndroidManifest.xml and main/res/xml/update_paths.xml; android app GamepadPreviewUpdatesTest.kt.
- Signing/publish CI: android/app/build.gradle, .github/workflows/gamepad-preview.yml, .github/workflows/ci.yml.
- Build commands where available: npm ci then npm test; dotnet run --project native/update-tests/WinDockUpdateTests.csproj -c Release; dotnet run --project native/gamepad-tests/WinDock.GamepadTests.csproj -c Release; Android CI uses assembleDebug testDebugUnitTest lintDebug and private signing key; read-only Windows baseline: dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --scan.
- **Do NOT run a Windows driver experiment on owner's PC without explaining UAC, signing, trust/root-cert effects and rollback.** Separate isolated harness before integration.

## Packaging/updater hard rules

- Preview-only updates use OWN FORK published, non-draft GitHub prereleases. Version number increases; release tag/asset URL/name/SHA-256/size strictly validated. Ask before download AND before starting Windows setup or Android system installer; no silent installation/permission bypass. Regular WinDock never points to fork preview feed.
- Build fails rather than falling back to an ephemeral Android signing key. Every future release should include both platforms + SHA256SUMS, BUILD-INFO, SIGNING-INFO. Match PUBLIC signer SHA-256 across future APKs and test actual Android package installer confirmation. No signing secrets, backups or private JKS in repository, release artifacts, logs or chat.
- CI tests do not prove physical upgrade or gamepad compatibility. Windows unsigned preview installer not silently trusted; installer may need user confirmation. Avoid inaccurate user messaging.

**Newest verified code release for app-state/brightness corrective build:** [Gamepad Preview 0.2.3-gamepad.12](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.12-g2e80adb) from `2e80adb`, [release workflow #40002230727](https://github.com/Farzansayeed/WinDock/actions/runs/40002230727) and [CI #40002230776](https://github.com/Farzansayeed/WinDock/actions/runs/40002230776) passed. Includes Windows+Android installers and private-signing verification with public SIGNING-INFO.txt. **The owner's real Windows/monitor/phone acceptance is not known.** Historical v11 is a signed baseline; future chats should prefer v12 or a newer numerically verified non-draft release. Owner's original report remains unresolved until physical verification.

**Verified Preview v13 (2026-10-23):** [WinDock Gamepad Preview 0.2.3-gamepad.13](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.13-gf164ea0) published **NON-DRAFT** from commit `f164ea0`; [release workflow #40008801028](https://github.com/Farzansayeed/WinDock/actions/runs/40008801028) and [multi-platform CI #40008801048](https://github.com/Farzansayeed/WinDock/actions/runs/40008801048) succeeded. Both Windows/Android installers, SHA256SUMS.txt, BUILD-INFO.txt and PUBLIC SIGNING-INFO.txt are published, Windows installer smoke and Android keystore signature checks passed. **No physical Spotify activation or in-place upgrade has yet been tested.**

## Spotify installation now CONFIRMED classic Win32 (2026-10-24), not Store

Owner explicitly ran PowerShell: Get-StartApps showed Spotify's AppID is the Roaming Spotify.exe executable; Get-AppxPackage '*Spotify*' returned NO app package; Test-Path "$env:APPDATA\\Spotify\\Spotify.exe" was True. Stop pursuing Store/MSIX activation as the cause for THIS Spotify installation; the v13 COM patch targets another path. Source audit found server.js waited for a slow PowerShell running-window scan (hub.broadcast) before acknowledging launch/focus/close, likely causing the delayed phone 'Launch requested' toast. New code responds immediately after the helper launch/focus/close action and runs snapshot broadcast asynchronously, preserving background dots. Added live HTTP test with intentionally stalled Windows inventory to catch latency regressions. **No physical evidence Spotify opens through WinDock.** Next check new CI/published release, then user direct Windows Start/Start-Process Spotify.exe versus phone tile. If native direct start works but phone does not, investigate stored target/args, foreground restrictions and Spotify instance/process history. Do not claim fixed just from faster toast.

## New Spotify launch troubleshooting (unverified on real hardware)

Owner reports WinDock Spotify tile reports Launch requested after delay but does not open Spotify. Spotify for Windows is CEF-based desktop client, available as classic Spotify.exe or Store-packaged app (SpotifyAB.SpotifyMusic); owner's actual install is unknown. Previous PackagedApp.Launch used ShellExecute shell:AppsFolder and could return success without confirming activation. Code now uses Microsoft's documented IApplicationActivationManager (COM) HRESULT/processId activation, with sanitized HTTP 502 on failure, and leaves Win32 EXE launch unchanged. [Preview v13](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.13-gf164ea0) was successfully released with COM activation source and passing Windows/Android builds + CI. **Physical Spotify test still pending**; do not claim solved. Ask for safe Get-StartApps | Where-Object Name -Match Spotify; Get-AppxPackage *Spotify*; Test-Path "$env:APPDATA\Spotify\Spotify.exe"; direct Windows Start launch test. Different install routes need different fixes.

## Active user-reported non-gamepad regression — 2026-10-23

The user reports Android dock running-app dots don't update when Windows processes open/close outside WinDock, tapping an app says "Opened" but it never visibly opens, and monitor brightness returns the DDC/CI error. Audited relevant source: Windows provider, server sync, launch and brightness code matched fork main before the repair (not demonstrably caused by the Gamepad branch). A new code batch adds a connected-only running snapshot poll every 3 seconds, only emits changed running state, handles scan errors, updates UI toast to **Launch requested** instead of falsely claiming launch completion, refreshes shortly after tap, and retries brightness with VCP 0x10 if high-level DDC/CI WRITE fails. Unit/integration and CI + REAL DEVICE verification are required. If launch STILL doesn't work, inspect actual Windows shortcuts and process/session/permissions; don't mark solved based on toast. Monitor firmware/DDC menu may still prevent brightness changes. See WORKLOG and PROGRESS for evidence. **Prioritize preserving/fixing core WinDock app functions before proceeding to P2/VS1.**

## Priority next steps for any future agent

1. Recheck fork HEAD, GitHub Actions and numeric latest NON-DRAFT release; validate matching asset names/version/provenance. Don't assume GitHub releases ordering.
2. If user is installing/updating, help verify signed v11 on real Android and Windows. Do NOT infer what is currently installed; if older Preview signature conflicts, uninstall only old Preview once (preview-local settings lost). On next same-key version, compare SIGNING-INFO certificate fingerprint and test in-place Android upgrade with settings preserved; document user-reported result.
3. Main implementation bottleneck is **P2 approved signed/licensable Windows virtual Xbox/XInput backend**, with isolated proof (XInput slot, actual A/analog values, release/cleanup/crash/uninstall, .NET runtime implications). Do not pick a driver based only on README claims.
4. Then minimum VS1 end-to-end: native Android one-stick+A → authenticated paired WinDock input session → bounded ordered controller reports → persistent native Windows receiver with timer-based neutral watchdog → proven virtual Xbox device recognized in Windows game/testing. Test Wi-Fi and ordinary USB tether.
5. Only AFTER VS1 proceed to full optional controls, per-user customizable editor, profile storage and real latency measurements. Keep **P8 Touchpad optimization after full Gamepad v1**.
6. Update **PROGRESS.md + WORKLOG.md** together with code, and refresh this handoff/AGENTS when milestones or user decisions change.

**Source precedence:** latest verified GitHub repository/test/release evidence → PROGRESS live checklist → this dated snapshot → WORKLOG historical entries → older architecture drafts. Never invent hardware evidence or release links.
