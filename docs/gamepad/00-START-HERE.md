# WinDock Universal Gamepad — START HERE

**ACTIVE OWNER PLAN (2026-10-25):** Personal/friends prototype, no main merge/public ship. **Read [PRIVATE-MULTIPLAYER-ROADMAP.md](PRIVATE-MULTIPLAYER-ROADMAP.md) FIRST** and [ARCHITECTURE-OWNERSHIP.md](ARCHITECTURE-OWNERSHIP.md) for exact current state/file roles and the new M0→M8 phases. Older roadmap phase priorities below are historical. M0 driver-neutral timing/EOF test reliability + real Kotlin authenticated transport integration baseline, followed by separate optional driver approvals, then multiplayer/low-end tuning. Current single owner, production /gamepad HTTP 503, no physical Xbox or multiplayer. **2026-10-25 OWNER SCOPE CHANGE — PRIVATE MULTIPLAYER / LOW-END PERFORMANCE ROADMAP:** Owner states WinDock is currently for personal use and a few friends, NOT public distribution, release or merge to main; requires low-latency natural-feeling UI, scalable low/high-end Android performance, future simultaneous multiplayer and clear modular maintainable code without stale or broken paths. HIDMaestro remains first CONDITIONAL private Windows lab candidate, not approved installer or proven Xbox backend; no vendor binary acquisition/execution, admin elevation, certificate changes, security bypass or purchase. Starting from [docs-only handoff 066391c](https://github.com/Farzansayeed/WinDock/commit/066391ce044f1fbef14b7de14fae22cedbed28f9), [CI #40185314370](https://github.com/Farzansayeed/WinDock/actions/runs/40185314370) PASS and [v46](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.46-g72afe3b) published; new canonical [private-first roadmap](PRIVATE-MULTIPLAYER-ROADMAP.md) and [architecture ownership map](ARCHITECTURE-OWNERSHIP.md) describe M0 FIRST: deterministic timing/EOF fake-sink tests, local instrumented Kotlin-to-WS transport baseline, one-owner safe seam for future multi-session, no real driver. M1 single-player fake transport; M2 explicitly approved optional HIDMaestro lab trial; M3 real latency/ergonomics; M4 independently leased/tested multi-session/slots; M5 verified 2→4 player physical Xbox test; M6 tune low-end/UI; M7 personal/friends consent-based packaging; M8 public release only if requested. 4 slots are target NOT proven capability; low-end speed parity an optimization target NOT promise. No physical test added for docs-only milestone. Both PROGRESS and WORKLOG updated in same commit; new CI awaits actual verification.

**CURRENT RESUME OCTOBER 26:** Canonical [HANDOFF-2026-10-26.md](HANDOFF-2026-10-26.md); [3d5bf3b](https://github.com/Farzansayeed/WinDock/commit/3d5bf3b90bf7579a809082b46f5021a5c5d05028), [CI #40131398154](https://github.com/Farzansayeed/WinDock/actions/runs/40131398154) PASSED, [Preview workflow #40131398148](https://github.com/Farzansayeed/WinDock/actions/runs/40131398148) PASSED, [Preview v32](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.32-g3d5bf3b) published. Owner accepted Windows Preview install, physical read-only zero connected XInput slots and Android v25 tests. No new hardware checks for hidden native fake sink. P2 signed offline Xbox backend and VS1 gameplay remain blocked, privileges not approved. Older snapshots below are historical.

**CURRENT CONTINUATION STATE (2026-10-23):** [SESSION-HANDOFF.md](SESSION-HANDOFF.md) is the concise full handoff for future chats. [PROGRESS.md](PROGRESS.md) is the canonical live checklist and [WORKLOG.md](WORKLOG.md) contains dated evidence. The signed [Gamepad Preview v11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e) passed GitHub Actions, including private-keystore APK signer verification; Windows virtual Xbox controller/gamepad network transport are NOT implemented, and physical upgrades remain untested. Older sections below may describe earlier checkpoints and should not override this status.


**Canonical fork:** https://github.com/Farzansayeed/WinDock
**Work branch:** `feature/universal-gamepad`
**Upstream:** https://github.com/aliihsaad/WinDock
**Plan recorded:** 23 October 2026
**Status (2026-10-23 P1 implementation):** Touch & sign now contains a **Gamepad UI-only preview and direct switching**; an isolated mocked mode-switch test passed 21 assertions, but full npm/CI/Android verification is pending. Windows driver candidate research and [P2 feasibility test plan](P2-DRIVER-FEASIBILITY.md) are documented, and a [read-only XInput diagnostic](../../native/gamepad-probe/README.md) is coded; real Windows build/hardware proof has not begun. **No real gamepad input, virtual controller or latency measurement exists yet.** P2 Windows driver feasibility is next, followed by VS1 real phone→PC proof.

## Why this exists

Add an optional **Gamepad** input mode to the **existing** WinDock Android companion and Windows PC host. The phone should act as a configurable physical-gamepad-like virtual Xbox-compatible controller in supported PC games, not merely keyboard WASD/mouse emulation. The user wants rapid **Touchpad <-> Gamepad** switching without going back to the dashboard. All project work is in the **user's fork only**; do not create an upstream PR or issue unless subsequently requested.

## Non-negotiable product decisions

- Keep the dashboard action **Touch & sign**; Gamepad lives in this same input section, **not** as a separate main dashboard tile.
- The input space offers **Touchpad | Signature | Gamepad**. Touchpad remains fullscreen with existing bottom controls, and gains an obvious Gamepad shortcut beside its existing back/signature/keyboard navigation. Gamepad has a direct return-to-Touchpad action. Switching stops and neutralizes the previous mode; stay within the same input surface.
- Every control group can be selected: 0/1/2 analog sticks (1 stick can represent logical left or right), D-pad, ABXY, LB/RB, LT/RT, Menu/View. L3/R3 optional. Groups can be placed/resized; profiles stored locally; never require all controls on screen.
- No haptics/rumble/phone vibration/adaptive triggers. **No gyroscope initially**; revisit only after normal controls pass real-device validation.
- Latency matters; use direct native Kotlin `MotionEvent` capture and a long-lived native PC receiver, benchmark UDP (gameplay data plane) against existing Node/WebSocket route before claiming gains. Node remains viable for discovery/pairing/control plane.
- First Windows controller mode: virtual Xbox 360/XInput if legally/deployment viable. PlayStation *visual labels* are not equivalent to a native DualSense. Driver viability must be researched, tested and documented; don't assume an archived or licensed driver is free/redistributable.
- Local-only Wi-Fi or USB tethering; no accounts/cloud/telemetry. Existing input, signing, capture, discovery and pairing must not regress.
- Force all controls neutral immediately on mode switch, app background, disconnect, timeout, or native receiver failure. A stuck throttle/trigger is unacceptable.

## Existing source integration map

| Area | Verified files |
|---|---|
| Input modal and navigation | `public/index.html` |
| Input selection, Touchpad/Signature lifecycle | `public/input-pad.js` |
| Main drawer action wiring | `public/app.js` |
| Fullscreen touchpad and signature styles | `public/style.css` |
| Android Kotlin trusted WebView activity/keyboard bridge | `android/app/src/main/java/com/windock/app/MainActivity.kt` |
| Existing paired LAN host | `server.js`, `src/auth.js`, `src/input-hub.js` |
| Native helper lifecycle | `src/platform/input.js`, `src/platform/windows.js` |
| Windows C# helper | `native/win/Program.cs`, `native/win/Touchpad.cs` |
| Existing tests and CI | `scripts/verify-input.mjs`, `test/run.mjs`, `.github/workflows/ci.yml` |

**Install/download preview builds:** the first GitHub prerelease [0.2.3-gamepad.1](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.1-gc631611) passed automated builds/tests (manual Android/Windows installation still pending). [INSTALL-PREVIEW.md](INSTALL-PREVIEW.md) and [fork's prereleases](https://github.com/Farzansayeed/WinDock/releases) after successful Actions. Every code push runs a versioned preview build; docs-only commits do not rebuild. These are development packages, not functional gaming controllers. Never point to upstream release downloads for fork features.

**Controller parsing contract (2026-10-23):** Strict JS v1 parser has matching .NET 8 C# parser / fail-neutral session model in `native/gamepad-tests/` with tests wired into Windows CI. **These are isolated test models, not working phone input or a Windows virtual gamepad.**

**Protocol foundation (2026-10-23):** `src/gamepad/protocol.js` defines strict bounded controller snapshots and a unit-tested fail-neutral state gate, **not yet wired to a live controller, native Windows driver, Android transport, or paired WebSocket**. Source tests in `scripts/verify-gamepad-protocol.mjs`. Keep this separate from the existing Touchpad protocol.

**Native Android input slice (2026-10-23):** `GamepadTouchModel.kt` + `GamepadTouchView.kt` implement a left analog stick + A button local-only prototype, accessible from trusted Touch & sign Gamepad via the existing Kotlin companion bridge; returns directly to Touchpad. **No PC gamepad events yet.** Android JVM tests exist; consult PROGRESS/WORKLOG for actual CI evidence.

**Latest tested installable preview:** [0.2.3-gamepad.5](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.5-g0a81c22) (Android + Windows builds, native JVM tests, automated Windows installer verification and CI passed). Hardware/user acceptance still pending; gamepad is *local-only*, no virtual PC controller.

**New update-system handoff:** [UPDATES.md](UPDATES.md) details Windows/Android Preview update check, consent, SHA-256 verification, Android stable signing requirements, source map, CI gates and next tasks. Read it before touching installs, signing or release automation. Updater is not a silent install or yet physically validated.

**Signing release milestone:** [Preview v0.2.3-gamepad.11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e) published following passing stable-keystore APK signer verification ([Actions #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556)). Public signer SHA-256 recorded as SIGNING-INFO.txt. **Hardware/phone installation not verified yet; do not claim seamless APK upgrading until second same-key version updates over v11 on a real device.**

**Newer Preview v12 with fixes:** [v0.2.3-gamepad.12](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.12-g2e80adb) passed CI and Windows+Android build/publish checks, while real owner phone/monitor tests are still outstanding. Its running-app update, truthful launch acknowledgement and DDC/CI fallback implementation is in [WORKLOG.md](WORKLOG.md) and [SESSION-HANDOFF.md](SESSION-HANDOFF.md). Earlier v11 references are historical signing milestones, not the newest download.

**Universal desktop launcher Preview v16 verified (2026-10-24):** [WinDock Gamepad Preview 0.2.3-gamepad.16](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.16-gf8d8a0e) is published and non-draft from source commit `f8d8a0e`; [Windows+Android release workflow #40011693658](https://github.com/Farzansayeed/WinDock/actions/runs/40011693658) **PASSED** Windows native helper build, installer installation/upgrade/uninstall smoke, Android APK/unit/lint+permanent keystore signer validation, and release publication. [CI #40011693770](https://github.com/Farzansayeed/WinDock/actions/runs/40011693770) passed Linux, macOS, Windows and aggregate. Both Windows/Android packages, BUILD-INFO.txt, SHA256SUMS.txt and PUBLIC SIGNING-INFO.txt are present. **Actual user's WinDock Spotify/window focus, other app and running dot, DDC/CI, and Android in-place upgrade remain UNTESTED on physical devices**; never claim universal resolution solely on CI.

**Gamepad roadmap development milestone (2026-10-24):** [Gamepad Preview v0.2.3-gamepad.20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083) from source commit `c138083` was verified **non-draft/published** with Android Preview APK, Windows Preview installer, SHA256SUMS.txt, BUILD-INFO.txt and public SIGNING-INFO.txt. [Preview workflow #40015513571](https://github.com/Farzansayeed/WinDock/actions/runs/40015513571) passed Android unit/lint/APK/permanent signer, Windows installer smoke and publishing; [feature-branch multi-OS CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520) passed. It includes authenticated driver-neutral single-owner /gamepad WebSocket + strict state/replay/timeout checks, native .NET 8 independent real-timer fail-neutral fake report sink, and new Kotlin v1 stick+A full-state codec/JVM tests. **Production /gamepad upgrade intentionally returns 503 without real Xbox device backend; Gamepad remains local-only on Android, NOT usable in Windows games.** Real signed device + end-to-end hardware acceptance required.

## Read next (in order)

0. **[PROGRESS.md — live checklist, done/next/blocked](PROGRESS.md)**, [P2 — Windows driver feasibility test plan](P2-DRIVER-FEASIBILITY.md), **[AUDIT.md — prioritized risks and go/no-go gates](AUDIT.md)** and **[WORKLOG.md — chronological updates](WORKLOG.md)**

1. [Visual reference — actual current UI screenshots](UI-REFERENCE.md)
2. [01 — UX and screenshot-derived navigation](01-UX-NAVIGATION.md)
3. [02 — Implementation, security, testing and milestones](02-IMPLEMENTATION-ROADMAP.md)
4. [Full low-latency v2 technical handoff](REQUIREMENTS-v2.md) — authoritative detailed baseline except later changes above
5. [Open-source research: virtual gamepad comparisons, warnings and integration](OPEN-SOURCE-RESEARCH.md)
6. [Post-Gamepad P8: Touchpad latency improvements](TOUCHPAD-LATENCY-P8.md) — **deferred until the gamepad is complete**
7. [Archived initial requirements](archive/INITIAL-PROPOSAL-v1.md) — historical only; includes rejected ideas; **not** current requirements

## Project progress and continuous handoff

**[Open the live implementation checklist](PROGRESS.md)** (P0–P7, what's done, what is next, blockers, tests and milestone gates). For chronological decisions and commit-by-commit evidence, see **[WORKLOG.md](WORKLOG.md)**.

At the last documented status, **P0 is complete; P1 UI-only navigation code is committed pending regression/Android checks; P2 driver/XInput feasibility is the next technical gate, then VS1 minimum playable proof**. No working gamepad or real latency measurement has been verified. The tracker takes precedence over this snapshot. Six external open-source gamepad projects were compared in [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md); the user's Touchpad-latency improvement request is **queued as P8 after Gamepad P7**, not active work. Each code batch must update PROGRESS and WORKLOG in its commit; refer to `AGENTS.md`.

## What is finished and what is not

- [x] User fork verified writable; development branch created.
- [x] Requirements and navigation agreed; full plans committed in these docs.
- [x] Gamepad UI preview and direct Touchpad switching coded/CI tested; no working PC gamepad yet.
- [ ] Android native multitouch custom layout editor and storage implemented.
- [ ] Secure PC session negotiation and native input transport implemented.
- [ ] Virtual controller driver chosen, integrated and licensed for distribution.
- [ ] Real phone/Windows testing, PC gamepad compatibility and latency measurements; source/preview CI has passed.
- [x] Versioned PREVIEW installers/APKs published; v11 uses permanent APK signing verified in CI (stable gamepad release not ready).

## Continue in a fresh ChatGPT/Codex chat

**For a new chat, direct the assistant first to [SESSION-HANDOFF.md](SESSION-HANDOFF.md) and root AGENTS.md; both explicitly preserve current state, signing, next steps and what's not tested.**

> Work on https://github.com/Farzansayeed/WinDock, branch `feature/universal-gamepad`. First read `docs/gamepad/00-START-HERE.md`, **`PROGRESS.md`**, **`AUDIT.md`** and **`WORKLOG.md`**, `UI-REFERENCE.md`, `01-UX-NAVIGATION.md`, `02-IMPLEMENTATION-ROADMAP.md` and `REQUIREMENTS-v2.md`. Update the checklist and worklog with every code batch, including testing evidence and the next action. Do not ask me to repeat this brief. Implement incrementally on **my fork only**, preserve original features, write tests, and clearly separate a visual prototype from working virtual-controller support. Do not introduce haptics or gyroscope in v1; keep Touchpad latency as P8 **after** Gamepad P7; use `OPEN-SOURCE-RESEARCH.md` for architectural inspiration/licensing cautions. Do not open a PR to the original project.
