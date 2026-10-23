# WinDock — binding instructions for future ChatGPT/Codex agents

**READ FIRST:** docs/gamepad/SESSION-HANDOFF.md (complete current-context snapshot) → docs/gamepad/PROGRESS.md (live canonical task checklist) → docs/gamepad/WORKLOG.md (chronological test evidence). Then docs/gamepad/UPDATES.md, 00-START-HERE.md, AUDIT.md, P2-DRIVER-FEASIBILITY.md and REQUIREMENTS-v2.md as required. Old drafts and historical status snapshots are not current verification.

## Repo and scope

Work only on OWNER fork https://github.com/Farzansayeed/WinDock in **feature/universal-gamepad**. Do not push fork main, change aliihsaad/WinDock upstream, open upstream PRs or install/elevate a Windows driver/certificate without explicit approval. Existing WinDock functionality (Touchpad, Signature, keyboard, pairing, capture/recording, media, Windows/Linux) must not regress.

User wants **real virtual Xbox/XInput Gamepad inside existing Touch & sign** with one-tap Touchpad ↔ Gamepad, not a dashboard tile or keyboard/WASD substitute. Native Kotlin in same Android companion APK. Full v1 optional layout supports 0/1/2 sticks (single left/right role), D-pad, ABXY, LB/RB, analog LT/RT, Menu/View, optional L3/R3, independently shown/moved/resized and locally stored. No gyro, rumble or haptics in v1. Pairing/gameplay local Wi-Fi or normal USB tether; no cloud, no ADB requirement. All inputs must fail neutral on release, pointer cancel, app background, disconnect, timeout, PC/native driver crash.

## Code, tests and documentation obligations

Make actual incremental tested code changes, not repeated planning. **Every meaningful code commit MUST update BOTH docs/gamepad/PROGRESS.md and docs/gamepad/WORKLOG.md in SAME commit**, with branch, commit, exact tests and CI run/release link, failures/not-run manual/hardware tests, next task. Refresh SESSION-HANDOFF.md, AGENTS.md, UPDATES.md or UX/reference docs when architecture/release/requirements change. Do not claim XInput, gameplay, full upgrade or latency proven based on UI mocks or CI.

Main blocker: **P2 proven legal, signed and reversible Windows XInput virtual device** (HIDMaestro .NET 10 + admin/cert vs current .NET 8, licensed libvirtualhid, retired ViGEmBus). No device driver selected or installed. Build isolated test harness with explicit user-visible privileges and rollback before embedding; never elevate existing Node host or alter trust store silently. Then VS1: native Android left-stick+A → owned authenticated pairing/session → new bounded sequenced gamepad protocol → persistent native Windows device + PC-side timeout/neutral watchdog → actual XInput/game tester. Benchmark existing authenticated WebSocket/persistent helper first; UDP only if measured advantage and its security are demonstrated. Full layout editor only AFTER VS1. **P8 Touchpad latency strictly after full Gamepad v1/P7 acceptance**.

## Preview release / signing: milestone verified 2026-10-23

[Gamepad Preview v0.2.3-gamepad.11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e), sourced from 175942e, published Windows Preview installer + Android APK + SHA256SUMS.txt + BUILD-INFO.txt + SIGNING-INFO.txt. [Release workflow #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) passed: Windows installer smoke and Android build/lint/tests, user-configured permanent Android signing secrets operational and APK public signing certificate SHA256 matched the keystore public certificate; publishing passed. [CI #39998130774](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) passed. This is **LOCAL UI/one-stick+A preview**, not playable Windows controller, and real Android/Windows user install and in-place upgrade remain UNTESTED. Verify latest live HEAD/Actions/release each chat; GitHub API ordering is unreliable.

User already configured FOUR private GitHub Actions secrets. **Never ask for or access JKS, passwords, secret values, private key, base64 keystore, PINs/tokens.** Owner maintains secure offline backup. Signing CI requires these secrets and fails rather than publishing wrong APK. SIGNING-INFO.txt contains only public fingerprint. Old per-run-debug Gamepad Preview may need Preview-only uninstall ONCE to migrate; regular WinDock stays installed. Smooth future updates require a SECOND APK signed with SAME public certificate SHA256, Android installer confirmation, real-phone in-place upgrade and preservation of Preview data. NEVER claim completed without device test.

Windows Preview and regular WinDock have separate install/config but share local port 8620; quit one before running the other. Windows Preview installer unsigned; normal Windows security/setup prompts apply. Updates on Preview are opt-in: fork-specific Check for updates → ask → GitHub published release exact tag/URL/asset/size/SHA256 verification → ask → Windows setup or Android SYSTEM installer consent. No silent OS install or signature bypass. Internet needed only for GitHub software updates, not gameplay.

## Mandatory priority in new chats

1. Re-query HEAD, latest successful NON-DRAFT numbered preview, Actions + actual assets; honor past verified milestone vs fresh release state.
2. If user testing updates, verify signed v11 first and NEXT same-key version fingerprint + real Android/PC upgrade. Never use upstream releases for fork features.
3. Else implement safe P2 Windows signed XInput feasibility proof, then authenticated VS1 playable one-stick+A.
4. Run npm tests; Windows .NET gamepad/update tests; Android tests/lint and preview release workflow; distinguish source/CI success from real physical gamepad tests.
5. Update PROGRESS + WORKLOG in every code commit; update SESSION-HANDOFF as decisions evolve. Never ask user to repeat prior requirements.

Detailed file map, exact build commands, constraints, risks, results and next steps: **docs/gamepad/SESSION-HANDOFF.md**.

## Active base-WinDock regression triage 2026-10-23

Owner reported stale Android dock running indicators, "Opened" toast when Windows app never appears, and brightness DDC/CI failure. Treat these as REAL user-visible acceptance blockers alongside Gamepad work. Core launch/brightness/sync implementations were identical to fork main at audit. New fixes add connected-only ~3s running-state change poll, truthful launch-request toast plus short refresh, and hardware-limited DDC primary-write → VCP0x10 fallback. **Do not claim they're fixed without CI + owner's PC/phone/monitor results.** Next chat checks post-fix build/release, then tests actual running dots/Windows app launch and DDC OSD support. Do not install drivers/elevate host to solve ordinary app launching. Preserve paired-only data refresh; no cloud/telemetry. Document tests and unresolved hardware blockers in PROGRESS/WORKLOG. Touchpad P8 latency remains deferred (this is correctness, not performance optimization).
