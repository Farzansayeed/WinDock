# WinDock Universal Gamepad — NEXT SESSION HANDOFF

**2026-10-24 VERIFIED FOLLOW-UP:** [Code commit 5a21ea5](https://github.com/Farzansayeed/WinDock/commit/5a21ea59d2755745b98e4c260086d07ef8ee5e21) passed [all-OS CI #40117635358](https://github.com/Farzansayeed/WinDock/actions/runs/40117635358) including **PowerShell 5.1 XInput read-only script run on Windows runner from System32**, and [Preview publish #40117635340](https://github.com/Farzansayeed/WinDock/actions/runs/40117635340) passed. [Non-draft Preview v26](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.26-g5a21ea5) with Windows installer, signed Android APK, SHA256SUMS, BUILD-INFO and public SIGNING-INFO exists. User's v25 Android signed update & Gamepad/WinDock regression checks both PASS (no Android code changed; DO NOT RE-ASK). Only pending user acceptance = SDK-free Windows baseline physically on their PC. Original attempted .NET command failed before probing because no SDK + System32 working directory. Do not select/install a driver, elevate, change cert trust, or claim XInput gameplay. Spotify/dots/DDC/Edge icon deferred.

**2026-10-24 OWNER TEST / FIX:** Owner confirmed both Preview v25 Android tests PASSED (signed update and native Gamepad/WinDock regression); DO NOT re-test. Windows P2 .NET baseline DID NOT RUN from `C:\\WINDOWS\\system32`: no .NET SDK found and repo-relative path wrong. New `native/gamepad-probe/WinDock-XInputBaseline.ps1` uses built-in Windows PowerShell 5.1 + read-only XInputGetState, works from any directory, no SDK/admin/driver/trust changes. README documents running standalone. Verify this source commit's Windows CI, then ask ONLY for owner's new four-slot baseline output; zero connected is normal, not a failure. Previous [2c05bbd](https://github.com/Farzansayeed/WinDock/commit/2c05bbdda5da4a7eb856cce975bfb363a2db6513) CI+preview published [v25](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.25-g2c05bbd). No real XInput driver installed/selected/approved, no real game control, Spotify/dots/DDC/Edge deferred.

**2026-10-24 CURRENT VERIFIED RELEASE:** [Preview v24](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.24-ga98eef2) from [`a98eef2`](https://github.com/Farzansayeed/WinDock/commit/a98eef26a74ddba11e97397aae3930ccd29b4997): [CI #40113968394](https://github.com/Farzansayeed/WinDock/actions/runs/40113968394) passed all OS jobs, [release #40113968453](https://github.com/Farzansayeed/WinDock/actions/runs/40113968453) passed Android JVM/lint/keystore verification, Windows installer smoke and publication. Kotlin gamepad owner handshake and trusted local WS target pure models have FAKE-socket tests but production Android Gamepad still LOCAL ONLY / Windows /gamepad returns 503. P2 probe `--baseline` builds and executes on Windows CI, not yet on owner's PC. Owner previously PASSED all four v23 physical regression checks, but has NOT yet tested v24. Edge icon appears M (owner report) — DEFER. Must end each new session with interactive checklist and optional findings textbox, unchecked blocks Proceed. No Xbox driver approved, licensed, installed or physically verified.


**2026-10-24 CURRENT OWNER ACCEPTANCE:** v23 Android Preview hardware checks x4 PASSED by owner, no re-testing of the same acceptance without a new feature requirement. Owner's additional finding: Edge icon shows plain "M" instead of logo; **DEFERRED** until owner requests icon fixes. No XInput/PC gameplay proof. New staged next source work: Kotlin GamepadSocketTarget/OwnerChannel fake-socket ownership guards and `native/gamepad-probe --baseline`, no driver/socket enabled. Check latest branch CI and numbered Preview after merge. End each session with AGENTS.md checkbox+findings+gated Proceed/Report issues. Do not ask for driver installation without informed separate approval. 


**2026-10-24 continuation after accepted user checklist:** Prior docs acceptance PASSED (no findings). On branch `feature/universal-gamepad`, verified `3ba40ca` [CI #40110375230](https://github.com/Farzansayeed/WinDock/actions/runs/40110375230) passed; [Preview v22](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.22-g69ba9d7) is latest published non-draft at start of new Kotlin work. New `GamepadInputSession.kt` transport-neutral frame pump and fake-sink JVM tests staged; GamepadTouchView optional state observer remains unconnected, so no Android-to-PC gameplay. Re-check branch CI and numeric release after every change. **Always finish with mandatory owner checklist, optional findings text box, and gated Proceed / Report issues action per AGENTS.md.** P2 still blocked on approved signed/offline XInput proof, no machine-trust/drivers/privileged changes without explicit consent. Spotify/dots/DDC deferred.

**Frozen checkpoint: 2026-10-24.** Read this file FIRST in a future chat. Re-fetch GitHub HEAD, Actions and highest numeric published non-draft Gamepad Preview before treating any historical version as current.

## Owner's project and priorities

Owner fork: https://github.com/Farzansayeed/WinDock. Work ONLY on feature/universal-gamepad, not fork main or upstream aliihsaad/WinDock. Keep all existing Touchpad, Signature, keyboard/IME, pairing, media, capture and other original features intact.

**User explicitly paused Spotify, brightness/DDC and app-status troubleshooting to focus on unfinished Gamepad planning and implementation.** On owner's PC, WinDock Spotify tile STILL does not open Spotify after the v16 launcher fix. Direct Windows PowerShell Start-Process to the traditional roaming Spotify.exe does open it and creates multiple processes (one with visible window); Spotify is NOT Store-packaged. Running-dots and DDC problems also lack real-device resolution. Do NOT say these are fixed or divert to them unless user asks.

## Fresh verification 2026-10-24 (supersedes historical v20 evidence below)

- [`325bcb6`](https://github.com/Farzansayeed/WinDock/commit/325bcb6a9ed820bb7c4ec2fa95d0eb592b78afc7) Kotlin transport-neutral state pump + seven JVM tests and local-only touch observer; [CI #40111015027](https://github.com/Farzansayeed/WinDock/actions/runs/40111015027) PASSED all platforms; [release workflow #40111014996](https://github.com/Farzansayeed/WinDock/actions/runs/40111014996) PASSED Android unit/lint/signer, Windows installer smoke and publishing.
- Highest published non-draft now [Preview v23](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.23-g325bcb6), with both platform packages and public hashes/signing data. Do not confuse source/CI success with Android device test or working XInput gameplay.
- Owner has NOT yet accepted v23 hardware UI/navigation checks. New sessions finish with interactive checked-only acceptance, optional free-text findings box and a gated Proceed/Report issues action per AGENTS.md. P2 signed/redistributable/offline virtual Xbox driver remains BLOCKED, no approval for privileged install. Spotify/running dots/brightness deferred.

## Last checked GitHub evidence

- Latest confirmed published experimental Preview is [v0.2.3-gamepad.20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083) from SOURCE commit c138083 (not the subsequent docs-only commits). It includes Windows EXE, Android APK, BUILD-INFO.txt, SHA256SUMS.txt and public SIGNING-INFO.txt. This is NOT a playable PC gamepad.
- [Preview build #40015513571](https://github.com/Farzansayeed/WinDock/actions/runs/40015513571) passed Windows installer smoke, Android build/lint/JVM tests, permanent-keystore APK signature comparison and publishing.
- [Multi-OS CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520) passed Windows, Linux, macOS and aggregate, including WebSocket lab channel, Kotlin serializer and .NET fail-neutral fake sink tests.
- Later docs-only parent branch commit 5def46da506a32cace5bdbea4f0ee930363c1b70 passed [CI #40016195647](https://github.com/Farzansayeed/WinDock/actions/runs/40016195647). This newly created NEXT-SESSION handoff commit must have its CI checked separately. Docs-only changes do not publish new installers.
- The owner configured FOUR permanent Android Preview signing secrets and the release job verified them without ever revealing their contents. Never request or share JKS, passwords, Base64 keystore, GitHub tokens or pairing PIN. Owner keeps encrypted/offline backup; SIGNING-INFO contains PUBLIC certificate fingerprint only.
- NO real Windows virtual Xbox controller, physical XInput slot, supported Windows game control, live Kotlin phone-to-PC gamepad session, signed driver install/uninstall, actual Android in-place upgrade or latency measurement has been verified. Do not make those claims.

## Phase status: evidence vs unfinished work

- P0: project fork, UI/screens/requirements/plans and progress tracking complete.
- P1: Gamepad added INSIDE Touch & sign alongside Touchpad and Signature, direct Touchpad return, CI/JS checks; actual phone navigation/regression acceptance still pending.
- P2: current number-one BLOCKER: no legally distributable, signed, offline-compatible Windows virtual Xbox/XInput driver approved, installed or physically tested. Read-only native/gamepad-probe exists and Windows CI built it.
- P3: native Android Kotlin left stick+A input local overlay, pointer cancellation and frame encoder (exact V1 full-state JSON, monotonic sequence, explicit neutral) with JVM tests. NOT sending frames to PC yet; configurable 0/1/2 sticks, D-pad, ABXY, analog triggers and edit/presets pending.
- P4: strict JS/C# state models; .NET 8 independent real timer ControllerReceiver with fake IControllerReportSink and fail-neutral tests. No persistent native Windows IPC/real controller output.
- P5: paired/same-Origin /gamepad WebSocket with single ownership, bounded snapshot, sequence/replay/rate checks, stale/disconnect neutralization. Tested with in-memory sink; production route deliberately responds HTTP 503 without native driver sink. No Android socket wiring, authenticated native device IPC, Wi-Fi/tether gameplay.
- P6: physical controllers, actual game compatibility, simultaneous inputs, p50/p95/p99 latency, failure/reconnect and ergonomics pending.
- P7: isolated Windows/Android Preview v20, opt-in signed update mechanism and release jobs passed. Physical update/data preservation and stable distributable driver packaging pending.
- P8: Touchpad latency tuning explicitly DEFERRED until functional Gamepad v1, real P7 acceptance.

## Non-negotiable scope

The app must remain **completely local** for gameplay over ordinary Wi-Fi or USB tether: no cloud, accounts, ADB or telemetry required. GitHub HTTPS is only for manually approved software updates. Gamepad must be true Windows Xbox/XInput device support, not WASD/keyboard emulation. Android must be Kotlin inside existing companion APK; Gamepad inside existing Touch & sign section. Full v1 controls optional and movable/resizable with local profiles, 0/1/2 sticks (single stick left/right), D-pad, ABXY, LB/RB, analog LT/RT, Menu/View, optional L3/R3. NO rumble/haptics and NO gyro in v1. On cancel, pointer release, screen exit, background, disconnect, stale/replayed packets, native crash, driver loss: ALL buttons, sticks and triggers must return neutral on both phone and PC with independent PC watchdog.

## Critical P2 driver decision; no user approval given

See [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md) and vendor docs. HIDMaestro claims virtual controller but its current .NET 10 setup requires elevated permissions and machine root/trusted publisher certificate installation. libvirtualhid claims signed Windows Xbox/XUSB, but driver-backed use has paid machine licensing and periodic online checks/offline restrictions. ViGEmBus is archived/retired. **None is selected or approved**; do not silently install drivers, bypass Windows driver signing, add Root/TrustedPublisher certs, change WindowsApps permissions, buy licences or elevate host. Driver test on real Windows requires informed explicit user approval, rollback-capable disposable/snapshot machine, signed/legal/offline verification and clean uninstall. Actual XInput recognition/button/analog/trigger reports must be physically demonstrated.

## Next development order

1. New chat first checks live repo branch HEAD, Actions, numeric latest non-draft release and this handoff + AGENTS.md, PROGRESS.md, WORKLOG.md.
2. Progress safe non-admin code: build an isolated **persistent native Windows receiver / authenticated IPC sidecar** using fake IControllerReportSink and its OWN neutral watchdog, including Node process-crash teardown and clean owner lifecycle. Test in CI. Keep production /gamepad disabled without proven hardware sink. Keep existing /input Touchpad and / dock status unaffected.
3. Read-only P2 Windows baseline when the owner can test: native/gamepad-probe/README.md. Get Windows 10/11 version/architecture and baseline XInput slot scan. Research current signed, legally redistributable, maintainable offline-friendly driver; obtain explicit approval before isolated privileged test and rollback.
4. ONLY AFTER real XInput device confirmed: Kotlin stick+A + explicit neutral lifecycle → authorized paired /gamepad WebSocket → persistent Windows native sink → actual virtual Xbox output → game/joy.cpl tests on normal Wi-Fi and USB tether. Then optional editor/groups/profiles and measured P6 latency; P8 last.
5. For every meaningful code batch commit changes to BOTH PROGRESS.md and WORKLOG.md in same commit; record tests, fail/limitations, Actions URL, source SHA, real-vs-synthetic proof and single next task. Update this handoff on major decisions. No repeating approved questions/requirements.

## Optional OWNER prep; nothing required to close now

On Windows PowerShell without administrator privileges:

    Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,OSArchitecture
    dotnet --list-sdks

If the owner already has this repo checked out on feature/universal-gamepad with .NET 8 SDK:

    dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --scan

This command only READS current XInput slots. Zero connected slots is a normal baseline. No drivers need installing now. Keep JKS and password privately backed up. No need to install Preview v20 now because it cannot yet act as a PC controller. Regular and Preview WinDock Windows hosts share local port 8620, so quit regular host if testing Preview.

## Copy/paste into next ChatGPT/Codex chat

Continue my WinDock Universal Gamepad project on Farzansayeed/WinDock branch feature/universal-gamepad. Read AGENTS.md and docs/gamepad/NEXT-SESSION.md FIRST, then PROGRESS.md, WORKLOG.md, P2-DRIVER-FEASIBILITY.md, and audit as needed. Re-check live GitHub head, latest successful numbered Preview release and Actions. Spotify app launching, running dots and monitor brightness are deferred; do not investigate them now. Continue unfinished Gamepad development with actual code and tests, prioritizing P2 legal, signed, offline-compatible Windows Xbox/XInput driver feasibility and a safe native receiver/IPC fake-sink harness toward VS1. Never install drivers, modify machine-trusted certificates, elevate, buy licences or ask for signing secrets without explicit approval. Preserve native Kotlin, existing Touchpad/Signature and completely local Wi-Fi/USB gameplay. Update PROGRESS and WORKLOG together for each meaningful code commit and distinguish CI scaffolding from physically working Gamepad. Do not ask me to restate approved requirements.

**No work runs asynchronously between sessions. This checkpoint is enough to close the chat.**
