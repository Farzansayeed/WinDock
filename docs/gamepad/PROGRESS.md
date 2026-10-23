# WinDock Universal Gamepad — LIVE PROGRESS TRACKER

**Canonical source of truth for status:** this document, on the `feature/universal-gamepad` branch of [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock/tree/feature/universal-gamepad).  
**Last reviewed:** 2026-10-23.  
**Current phase:** **P1 UI-only preview implemented, full CI/Android verification pending; P2 driver-independent diagnostic CODE READY, real Windows virtual-device test NOT STARTED**.  
**Next concrete task:** Run updated npm/Windows CI tests, then use the [read-only XInput slot probe](../../native/gamepad-probe/README.md) on a safe Windows 10/11 machine to capture a baseline; only then assess an approved signed driver with reversible install. P1 physical Android navigation check remains pending. No virtual-device proof exists yet; do not start editor before VS1.  
**Important status disclaimer:** gamepad input, virtual drivers, and latency measurements **are not implemented or verified**. The progress baseline counts documentation work only.

**Driver-feasibility test plan:** [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md), research only; no Windows driver selected or installed. **Feature-branch GitHub Actions runs:** zero observed through GitHub at the most recent check; don't interpret this as a pass. Actions may need enabling/review in the fork.

**Audit / risk gate:** [AUDIT.md](AUDIT.md) — 12 audited risks; A1/A2 (Windows virtual device) and A8 (neutral safety) are critical. Driver integration and app-to-game feasibility unproven. Follow audit execution gates; it supersedes phase ordering where inconsistent.

**New research:** [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md) compares six phone-controller projects, licensing, security flags and architecture integration. **Deferred P8:** [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md) is queued strictly **after Gamepad v1/P7** and is NOT part of the current work.

For requirements, read [START HERE](00-START-HERE.md), [actual UI screenshots](UI-REFERENCE.md), [UX flow](01-UX-NAVIGATION.md), and [full technical brief](REQUIREMENTS-v2.md). See [WORKLOG](WORKLOG.md) for chronological changes.

## Status key

- `[x]` **Done** = committed and reviewed/verified as stated (include test evidence when applicable).
- `[ ]` **Not done** = not implemented, not yet verified, or blocked.
- Mark **IN PROGRESS** or **BLOCKED** explicitly beside the phase title; do not confuse planned work with shipped features.
- "UI preview complete" must **not** be described as "controller works in games."

## At-a-glance

| Phase | Outcome | Status | Evidence / gate |
|---|---|---|---|
| P0 | Fork + preserved requirements + actual current-UI screenshots + continuity instructions | **DONE** | Source and docs committed; see [UI reference](UI-REFERENCE.md) |
| P1 | Gamepad added to existing Touch & sign navigation with UI-only preview | **CODE IMPLEMENTED / TESTS PENDING** | Relevant JS/HTML/CSS tests and manually validated navigation |
| P2 | Windows virtual Xbox controller backend feasibility and license decision | **READ-ONLY PROBE ADDED; DRIVER PROOF PENDING** | Driver comparison, native proof-of-concept, install/uninstall verification |
| P3 | Native Android Kotlin gamepad screen + selectable multitouch controls + editor | **NOT STARTED** | Android unit/instrumentation tests on real phone |
| P4 | Native Windows persistent receiver, virtual state mapping, neutral watchdog | **NOT STARTED** | Windows tests and `joy.cpl` hardware verification |
| P5 | Secure paired control plane + reliable gamepad transport; Wi-Fi and USB tether | **NOT STARTED** | Auth/replay/loss/reconnect tests + measured transport comparison |
| P6 | End-to-end game compatibility, input correctness, latency benchmarking | **NOT STARTED** | Real Android + PC; p50/p95/p99; regressions |
| P7 | Installers, upgrade/fallback handling, release documentation | **NOT STARTED** | Windows/Android install and upgrade tests |
| P8 | Improve existing Touchpad latency **after finished Gamepad v1** | **DEFERRED — AFTER P7** | Baseline/measured improvements, existing gesture regression tests |

**Progress accounting:** **P0 complete; P1 code committed pending testing; P2–P7 not complete; P8 Touchpad latency is deferred until Gamepad v1/P7.** No percentage estimate from phase count. Plan audit documented in [AUDIT.md](AUDIT.md) on 2026-10-23 (documentation-only). This is not a percent-of-development estimate. No Windows/Android end-to-end gamepad testing has been run.

## P0 — Repo setup, requirements and UI capture — DONE

- [x] User fork created at `Farzansayeed/WinDock`; source still attributed to upstream `aliihsaad/WinDock`.
- [x] Work branch `feature/universal-gamepad` exists, leaving fork `main` unchanged.
- [x] User constraints documented: 0/1/2 sticks; D-pad; ABXY; LB/RB; LT/RT; Menu/View; local drag/resize profiles.
- [x] Agreed navigation: Gamepad is **inside** existing **Touch & sign**, with direct Touchpad ↔ Gamepad switch.
- [x] Actual Signature, dashboard drawer, Touchpad UI screenshots committed as [WebP contact sheet](assets/current-ui-screenshots.webp), explained in [UI-REFERENCE.md](UI-REFERENCE.md).
- [x] Native Kotlin ↔ native Windows low-latency architecture proposals documented.
- [x] Out-of-scope choices recorded: **no haptics; no gyroscope in initial release**.
- [x] Created this progress tracker and [WORKLOG](WORKLOG.md).
- [ ] No implementation tasks or native tests are included in P0; see P1–P7.

## P1 — Navigation and UI-only preview — NEXT

**Goal:** one-tap navigation between fullscreen Touchpad and Gamepad while staying inside the existing Touch & sign experience; Signature continues working. **No fake controller connectivity.**

- [x] Add third `Gamepad` mode/tab and pane (or equivalent app-controlled launcher) inside `#input-pad` in `public/index.html`. **Source code committed; full P1 gate still pending.**
- [x] Add Gamepad shortcut to bottom-left Touchpad toolbar; leave existing Back/Signature/Keyboard controls. **Source code committed; full P1 gate still pending.**
- [x] Offer a prominent one-tap **Back to Touchpad** action from Gamepad without returning to dashboard. **Source code committed; full P1 gate still pending.**
- [ ] Update `public/input-pad.js` mode selection/state teardown safely, preserving existing touchpad release and signature drawing. **Source implementation present; manual regression validation still pending.**
- [x] Add responsive gamepad preview styles to `public/style.css` matching navy/charcoal grid, subtle glass and blue accents. **Source code committed; full P1 gate still pending.**
- [x] Show accurate capability/preview labels: **UI preview, not yet controlling PC games**; no misleading `Connected controller` state. **Source code committed; full P1 gate still pending.**
- [x] Add regression tests for mode switching and existing `Touchpad`/`Signature` behavior, update existing verification tests as appropriate. **Persistent mode-switch tests added as `scripts/verify-gamepad-ui.mjs` and registered in `test/run.mjs`, plus static `verify-pwa.mjs` assertions.**
- [ ] Run the full `npm test`/feature-branch CI and record results (not yet executed or confirmed); the **persisted mode-switch test executed in a mocked runtime and passed 21 assertions**; full Node/npm/CI and Android tests remain outstanding in the authoring environment.
- [ ] Manually verify Touchpad → Gamepad → Touchpad, Signature switching, Touchpad release, responsive layout and WebView behavior on a real Android phone.
- [x] Update the PWA service-worker cache key to prevent old input UI from persisting after an update.
- [x] Enable existing CI on pushes to `feature/universal-gamepad` (runs when GitHub Actions is enabled for this fork).

**Exit gate:** navigation flows work without dashboard detours, regressions are addressed, tests/results recorded in WORKLOG. **Code is implemented, but this gate remains open until CI and real UI checks pass. P1 does not mean usable gamepad input.**

## VS1 — Minimum playable end-to-end proof (NEW mandatory integration gate; after P2, before polished editor) — NOT STARTED

- [ ] Demonstrate **one native Android analog stick and one A button** controlling a real Windows virtual Xbox/XInput-visible device.
- [ ] For baseline, reuse authenticated WinDock connection with persistent WebSocket/helper before introducing UDP.
- [ ] Show immediate release and bounded PC watchdog on exit, app background, disconnect, stale packets, and process failure.
- [ ] Validate in Windows controller tooling and a supported PC game/test application; record result, hardware/version and limitations.
- [ ] **Only then** expand the full editor and begin UDP optimization, if measurements justify it.

**Exit gate:** one genuine phone→PC→virtual controller path works safely. Visual demo or synthetic-only frames do not pass.

## P2 — Windows virtual device feasibility — INSTRUMENTATION ADDED, DRIVER PROOF NOT STARTED

See [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md) for individual backend tradeoffs, safe install/rollback, XInput tests and go/no-go evidence requirements.

- [ ] Research and record signed Windows 10/11 virtual Xbox-compatible backend candidates, maintenance, redistribution/licensing, and uninstall/rollback.
- [ ] Build isolated native C# proof of concept for creating/removing a virtual controller; no gamepad network plumbing required yet. Compare HIDMaestro (.NET 10/admin + local cert) with existing WinDock .NET 8, licensed libvirtualhid, and retired ViGEmBus. **Never bypass driver signature enforcement.**
- [ ] Validate clean install, elevation/UAC lifecycle, machine certificate trust, signature legitimacy, Windows 10/11 support, and reversible uninstall; choose safe way to isolate administrative work.
- [x] Add a no-install, read-only XInput slot inspector in `native/gamepad-probe/` to support real Windows testing. **Source added, compilation/Windows execution pending.**
- [x] Wire .NET 8 diagnostic build/help into Windows CI and its static read-only invariants into `npm test`. **Not yet CI-confirmed.**
- [ ] Record a before/after XInput slot scan and changed A/axes against a separately approved virtual driver on real Windows.
- [ ] Verify recognized controller axes/buttons in Windows `joy.cpl` or equivalent.
- [ ] Record chosen driver + reasons in `docs/gamepad/`, including caveats; confirm any admin/install requirements.
- [ ] Prove neutral + destroy behavior and crash recovery on a real Windows PC.

**Exit gate:** a legal/deployable virtual controller backend works locally; if not, mark P2 **BLOCKED** and do not pretend generic keyboard emulation is equivalent.

## P3 — Native Kotlin UI, input and profiles — NOT STARTED

- [ ] Integrate native Kotlin `GamepadActivity`/`View` with trusted WinDock WebView bridge, preserving same connected PC and existing APK.
- [ ] Support individual pointer-ID multitouch: independent 0/1/2 sticks, D-pad, ABXY, LB/RB, LT/RT, Menu/View.
- [ ] Support one-stick mapping to logical left **or** right stick and true analog positions (not WASD), deadzones and Y inversion.
- [ ] Implement Edit Layout: drag/resize/toggle groups, safe regions; gameplay inputs neutral while editing.
- [ ] Implement local presets Full / Single Stick / Racing / Minimal / Custom, persisted per phone; profile changes reset hidden buttons.
- [ ] Native pause/cancel/background/rotate/exit handling neutralizes input immediately; no haptics or gyro v1.
- [ ] Real-thumb ergonomics: fixed/floating joystick center, pointer ownership, screen cutouts, button-size/contrast, accidental exit prevention and responsive landscape layouts.
- [ ] Android unit/instrumentation testing; check real device with concurrent multi-finger presses.

**Exit gate:** native Android screen and gesture/layout state are correct independently of PC games.

## P4 — Windows native receiver and controller state — NOT STARTED

- [ ] Implement persistent native C# gamepad service/receiver and a provider abstraction that does not disturb other OS providers.
- [ ] Map all analog/digital signals into virtual Xbox-compatible reports; support simultaneous buttons and analog trigger values.
- [ ] Test bounded rate, validation and ordering; no process spawning per touch/update.
- [ ] Implement ownership, neutral on stop, short staleness watchdog, driver-exit/crash cleanup.
- [ ] Windows helper tests and manual driver/controller inspection.

**Exit gate:** PC can apply validated synthetic test frames to the virtual controller safely.

## P5 — Android ↔ PC pairing and low-latency transport — NOT STARTED

- [ ] Reuse authorized WinDock PC pairing without leaking PIN/cookie/secrets to untrusted WebView pages.
- [ ] Add version/capability negotiation, bounded one-owner session start/stop, connect/reconnect state.
- [ ] First implement/measure persistent-helper authenticated WebSocket as the minimum viable baseline; **prototype native UDP only if benchmark results show a worthwhile improvement** over complexity/security cost.
- [ ] Full-state versioned protocol with sequence/epoch, freshness, malformed/replay protection, proper auth/key handling and explicit existing-LAN-HTTP threat caveat.
- [ ] Send immediate button edges and latest analog state; no stale queue buildup; watchdog on loss/disconnect.
- [ ] Validate on Wi-Fi and USB tethering without ADB requirement.

**Exit gate:** a paired native Android phone successfully drives a verified PC controller over supported local links, with safe disconnect.

## P6 — Performance and compatibility — NOT STARTED

- [ ] Test real games with controller support, Steam detection, Windows `joy.cpl`, all control groups and simultaneous gestures.
- [ ] Verify no stuck inputs under dropout, packet reordering, app background, connection loss, battery saving and fast mode switches.
- [ ] Record measured processing latency p50/p95/p99, outlier/jitter, connection type, device/OS specs, sample size, method and measurement scope.
- [ ] Compare native UDP vs existing Node/WebSocket route objectively if prototyped; optimize only observed bottlenecks, including touch sampling/display and thermal/battery impact.
- [ ] Define whether metrics represent Android touch event→PC virtual report or real end-to-end game display; avoid cross-device one-way timestamp claims without a clock synchronization strategy.
- [ ] Regression tests for existing Touchpad, Signature, media control, pairing and capture; run relevant `npm test`, Windows and Android suites.

**Exit gate:** evidence of usable gamepad with measured performance; targets are goals, **not achieved claims**.

## P7 — Packaging / handoff — NOT STARTED

- [ ] Package updated Windows host and Android APK with any lawful driver dependency/install UX and recovery.
- [ ] Verify first install, uninstall, updates, Android/WebView host-version mismatch behavior.
- [ ] Document usage, compatibility limitations and any admin privileges needed; include setup/screenshots and known issues.
- [ ] Run relevant CI checks and manually document the result. `.github/workflows/ci.yml` runs on PRs and main pushes, **not** by default on this feature branch.
- [ ] Tag/release **only when explicitly requested** and tested.

## P8 — Touchpad latency optimization — DEFERRED UNTIL AFTER GAMEPAD V1

- [x] User's requested post-gamepad Touchpad performance work recorded without changing P1–P7 scope.
- [x] Existing Touchpad pipeline identified and candidate bottlenecks documented in [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md).
- [ ] **After P7**, take real Touchpad latency baseline on Android+Windows (Wi-Fi and USB tether).
- [ ] Only then evaluate WebView touch sampling, `requestAnimationFrame` coalescing, WebSocket/Node, persistent native helper and optional native transport based on measurements.
- [ ] Implement and test improvements without breaking tap/scroll/pinch/drag, Signature or keyboard; record before/after evidence.

**Do not start P8 during gamepad feature construction, and do not assume gamepad UDP semantics apply to relative mouse deltas.**

## Research completed — documentation, NOT integration

- [x] Verified six open-source phone gamepad repositories and adjacent receiver/security documents; documented license and implementation caveats in [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md).
- [x] Extracted concrete WinDock integration recommendations, benchmark methodology and red flags (not copied source code).
- [ ] No candidate virtual driver or external mobile project has been integrated or physical-tested into WinDock as a result of this research.

## Explicitly deferred or excluded

- Gyroscope: **future optional exploration after P6 and user approval**, not a v1 backlog obligation.
- Haptics, rumble, vibration, adaptive triggers: **excluded**, not merely pending.
- Native PlayStation DS4/DualSense device emulation: **deferred**; PlayStation button skin/labels don't create a PS device.
- Linux virtual gamepad: later separate task; preserve existing Linux input.
- Cloud sync, remote internet relay, accounts, telemetry: excluded.

## Audit-required decisions (not yet made)

- [ ] D1 Virtual controller driver functional, licensed/distributable and Windows version compatibility demonstrated.
- [ ] D2 .NET/runtime/elevation/certificate/install/removal approach decided safely.
- [ ] D3 Native Activity/WebView return and pairing session lifecycle verified.
- [ ] D4 VS1 true phone→gamepad minimal playable path passes with neutral watchdog.
- [ ] D5 Connection transport benchmarked; UDP remains optional until evidence.
- [ ] D6 Physical UX, compatibility and latency measurement definitions recorded.

See [AUDIT.md](AUDIT.md) for the full risk register and sources.

## Documentation/update contract — mandatory for future work sessions

**Cross-repository research handling:** [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md) is the reference baseline. When integrating third-party ideas, record source/license attribution and driver/security decisions. Do not copy GPL app code into MIT WinDock without license review. **Keep P8 queued until Gamepad P7 completes**; update its checklist and worklog only when explicitly doing that later work.

**Every meaningful implementation batch/commit must update the docs in the SAME commit as the code whenever feasible:**

1. Read `docs/gamepad/00-START-HERE.md`, this tracker, [AUDIT.md](AUDIT.md), screenshot reference and most recent WORKLOG entry before editing.
2. After a batch, mark completed checklist items **only** when implemented and verified; leave unverified items unchecked and record blockers/unknowns.
3. Update `Current phase`, `Next concrete task`, the at-a-glance status and task checkboxes here.
4. Append to `WORKLOG.md`: date, commit/hash or branch, what changed, tests run and results (or "not run"), blockers, next action.
5. Update `00-START-HERE.md`, `UI-REFERENCE.md`, architecture specs and screenshots if decisions, actual UI or implementation paths changed.
6. Don't claim tests ran, measurements exist, drivers work, or releases were produced unless evidenced.
7. Commit progress/docs alongside implementation and link useful code/tests. If a session only updates docs, log it as documentation-only.
8. Work only on the owner's fork/feature branch, not the upstream project. Never commit secrets or pairing data.

**Note:** The documents don't update on their own when nobody is working on the repository. Future ChatGPT/Codex sessions should follow this contract whenever they make changes.
