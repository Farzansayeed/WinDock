# WinDock Universal Gamepad — LIVE PROGRESS TRACKER

**Canonical source of truth for status:** this document, on the `feature/universal-gamepad` branch of [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock/tree/feature/universal-gamepad).  
**Last reviewed:** 2026-10-23.  
**Current phase:** **P1 — Add Gamepad navigation and a clearly labeled UI-only preview inside Touch & sign**.  
**Next concrete task:** extend the existing input modal/navigation without changing the current touchpad, signature, or PC input protocol.  
**Important status disclaimer:** gamepad input, virtual drivers, and latency measurements **are not implemented or verified**. The progress baseline counts documentation work only.

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
| P1 | Gamepad added to existing Touch & sign navigation with UI-only preview | **NEXT / NOT STARTED** | Relevant JS/HTML/CSS tests and manually validated navigation |
| P2 | Windows virtual Xbox controller backend feasibility and license decision | **NOT STARTED** | Driver comparison, native proof-of-concept, install/uninstall verification |
| P3 | Native Android Kotlin gamepad screen + selectable multitouch controls + editor | **NOT STARTED** | Android unit/instrumentation tests on real phone |
| P4 | Native Windows persistent receiver, virtual state mapping, neutral watchdog | **NOT STARTED** | Windows tests and `joy.cpl` hardware verification |
| P5 | Secure paired control plane + reliable gamepad transport; Wi-Fi and USB tether | **NOT STARTED** | Auth/replay/loss/reconnect tests + measured transport comparison |
| P6 | End-to-end game compatibility, input correctness, latency benchmarking | **NOT STARTED** | Real Android + PC; p50/p95/p99; regressions |
| P7 | Installers, upgrade/fallback handling, release documentation | **NOT STARTED** | Windows/Android install and upgrade tests |

**Progress accounting:** **P0 complete; P1–P7 not complete**. This is not a percent-of-development estimate. No Windows/Android end-to-end gamepad testing has been run.

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

- [ ] Add third `Gamepad` mode/tab and pane (or equivalent app-controlled launcher) inside `#input-pad` in `public/index.html`.
- [ ] Add Gamepad shortcut to bottom-left Touchpad toolbar; leave existing Back/Signature/Keyboard controls.
- [ ] Offer a prominent one-tap **Back to Touchpad** action from Gamepad without returning to dashboard.
- [ ] Update `public/input-pad.js` mode selection/state teardown safely, preserving existing touchpad release and signature drawing.
- [ ] Add responsive gamepad preview styles to `public/style.css` matching navy/charcoal grid, subtle glass and blue accents.
- [ ] Show accurate capability/preview labels: **UI preview, not yet controlling PC games**; no misleading `Connected controller` state.
- [ ] Add regression tests for mode switching and existing `Touchpad`/`Signature` behavior, update existing verification tests as appropriate.
- [ ] Run `npm test` and record result; verify touchpad/signature in a real browser or Android WebView if available.

**Exit gate:** navigation flows work without dashboard detours, regressions are addressed, tests/results recorded in WORKLOG. **P1 does not mean usable gamepad input.**

## P2 — Windows virtual device feasibility — NOT STARTED

- [ ] Research and record signed Windows 10/11 virtual Xbox-compatible backend candidates, maintenance, redistribution/licensing, and uninstall/rollback.
- [ ] Build isolated native C# proof of concept for creating/removing a virtual controller; no gamepad network plumbing required yet.
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
- [ ] Prototype authenticated WebSocket and direct native UDP (via existing Wi-Fi/USB tether IP network), benchmark both; choose based on evidence.
- [ ] Full-state versioned protocol with sequence/epoch, freshness, malformed/replay protection, proper auth/key handling and explicit existing-LAN-HTTP threat caveat.
- [ ] Send immediate button edges and latest analog state; no stale queue buildup; watchdog on loss/disconnect.
- [ ] Validate on Wi-Fi and USB tethering without ADB requirement.

**Exit gate:** a paired native Android phone successfully drives a verified PC controller over supported local links, with safe disconnect.

## P6 — Performance and compatibility — NOT STARTED

- [ ] Test real games with controller support, Steam detection, Windows `joy.cpl`, all control groups and simultaneous gestures.
- [ ] Verify no stuck inputs under dropout, packet reordering, app background, connection loss, battery saving and fast mode switches.
- [ ] Record measured processing latency p50/p95/p99, outlier/jitter, connection type, device/OS specs, sample size, method and measurement scope.
- [ ] Compare native UDP vs existing Node/WebSocket route objectively; optimize only observed bottlenecks.
- [ ] Regression tests for existing Touchpad, Signature, media control, pairing and capture; run relevant `npm test`, Windows and Android suites.

**Exit gate:** evidence of usable gamepad with measured performance; targets are goals, **not achieved claims**.

## P7 — Packaging / handoff — NOT STARTED

- [ ] Package updated Windows host and Android APK with any lawful driver dependency/install UX and recovery.
- [ ] Verify first install, uninstall, updates, Android/WebView host-version mismatch behavior.
- [ ] Document usage, compatibility limitations and any admin privileges needed; include setup/screenshots and known issues.
- [ ] Run relevant CI checks and manually document the result. `.github/workflows/ci.yml` runs on PRs and main pushes, **not** by default on this feature branch.
- [ ] Tag/release **only when explicitly requested** and tested.

## Explicitly deferred or excluded

- Gyroscope: **future optional exploration after P6 and user approval**, not a v1 backlog obligation.
- Haptics, rumble, vibration, adaptive triggers: **excluded**, not merely pending.
- Native PlayStation DS4/DualSense device emulation: **deferred**; PlayStation button skin/labels don't create a PS device.
- Linux virtual gamepad: later separate task; preserve existing Linux input.
- Cloud sync, remote internet relay, accounts, telemetry: excluded.

## Documentation/update contract — mandatory for future work sessions

**Every meaningful implementation batch/commit must update the docs in the SAME commit as the code whenever feasible:**

1. Read `docs/gamepad/00-START-HERE.md`, this tracker, screenshot reference and most recent WORKLOG entry before editing.
2. After a batch, mark completed checklist items **only** when implemented and verified; leave unverified items unchecked and record blockers/unknowns.
3. Update `Current phase`, `Next concrete task`, the at-a-glance status and task checkboxes here.
4. Append to `WORKLOG.md`: date, commit/hash or branch, what changed, tests run and results (or "not run"), blockers, next action.
5. Update `00-START-HERE.md`, `UI-REFERENCE.md`, architecture specs and screenshots if decisions, actual UI or implementation paths changed.
6. Don't claim tests ran, measurements exist, drivers work, or releases were produced unless evidenced.
7. Commit progress/docs alongside implementation and link useful code/tests. If a session only updates docs, log it as documentation-only.
8. Work only on the owner's fork/feature branch, not the upstream project. Never commit secrets or pairing data.

**Note:** The documents don't update on their own when nobody is working on the repository. Future ChatGPT/Codex sessions should follow this contract whenever they make changes.
