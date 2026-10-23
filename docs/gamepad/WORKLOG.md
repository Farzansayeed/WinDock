# WinDock Gamepad — chronological worklog

**Canonical tracker:** [PROGRESS.md](PROGRESS.md)  
**Location:** `Farzansayeed/WinDock`, branch `feature/universal-gamepad`.  
**Rules:** newest entries at top; don't fabricate passing checks or completion; document actual code/test/decision evidence each work session. Every code batch should update this file and PROGRESS.md in the same commit. Do not log pairing secrets/device-specific private data.

---

## 2026-10-23 — Matching native .NET 8 gamepad state parser, fail-neutral lease and CI tests (code; CI pending)

**Changed:** Added `native/gamepad-tests/WinDock.GamepadTests.csproj`, `GamepadState.cs`, `Program.cs`. The Windows-only test job and Windows preview installer gate now validate a zero-driver, hardware-independent C# parser with the *same strict snapshot fields* and range checks as `src/gamepad/protocol.js`. It rejects malformed, replayed, oversized, unsupported or reserved-button frames, and neutralizes all fields on invalid, timed out or closed sessions.

**Limits:** This is **not** a virtual controller, Windows input worker, network transport, or security boundary. It runs entirely as an isolated native test and does not install drivers. No real Windows controller/device demonstrated.

**Tests:** GitHub CI Windows and installer workflow are configured to run the new C# tests; actual new-run result pending at time of commit. Prior JS test results separately tracked below.

**Next:** Confirm dual-language CI and numbered prerelease, then P2 real Windows XInput device proof and VS1 Android stick+A transport.

---

## 2026-10-23 — Gamepad v1 state protocol and fail-neutral model (code; CI pending)

**Changes:** Added `src/gamepad/protocol.js` defining a driver-neutral 10-field controller snapshot, explicit Xbox-style button mask, byte-size and numeric bounds, parser rejecting malformed/unknown fields, and a per-session gate rejecting stale/replayed frames while going neutral on invalid state, timeout or close. Added `scripts/verify-gamepad-protocol.mjs` with exhaustive positive/negative and timeout coverage; registered in `test/run.mjs`. This is isolated from the existing `/input` touchpad and *not* yet connected to Android, Windows or a network route.

**Security boundaries:** Authorization, transport ownership, cryptographic exchange, device driver and native Windows watchdog are NOT implemented by this module. A module-level timeout is a testable contract, not a production safety guarantee. All old touchpad behavior remains untouched.

**Tests:** Awaiting GitHub CI after commit. No physical game controller or Android/Windows hardware tested. No claim of playable gamepad support.

**Next:** Verify CI protocol tests, implement a compatible test-only .NET receiver model / fixture parity, finish P2 XInput backend proof on real Windows and then VS1 paired Android→Windows one-stick+A.

---

## 2026-10-23 — FIRST DOWNLOADABLE WINDOWS AND ANDROID PRERELEASE VERIFIED

**Release:** [WinDock Gamepad Preview 0.2.3-gamepad.1](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.1-gc631611) from commit `c631611`, GitHub Actions [preview run #39988106341](https://github.com/Farzansayeed/WinDock/actions/runs/39988106341). The Windows and Android build jobs, publish job, installer smoke test, Android unit/lint/signature validation succeeded. General [CI run #39988106319](https://github.com/Farzansayeed/WinDock/actions/runs/39988106319) also passed. Download assets confirmed: WinDockGamepadPreviewSetup.exe, WinDockGamepadPreview-Android.apk, SHA256SUMS.txt and BUILD-INFO.txt.

**What this proves:** Buildable/installable-package artifacts exist with version-tagged provenance and checksums; GitHub Windows automated install/launch/upgrade/uninstall smoke passed. **No owner's physical PC/Android installation or real gamepad input has been tested.** Android APK uses debug signing; Windows installer is unsigned. The Gamepad UI remains preview-only and P2 virtual Xbox driver proof remains open.

**Next:** Verify latest preview release and then perform manual Windows/Android setup and pairing test; continue driver feasibility. Do not claim stable release.

---

## 2026-10-23 — Downloadable preview workflow and version control (implementation, unverified release)

**User request:** Provide practical Windows/Android packages and keep them properly versioned with every meaningful code change, plus update project documentation.

**Committed source changes:** GitHub Actions build-and-prerelease workflow at .github/workflows/gamepad-preview.yml; separate preview Windows AppId/shortcut/uninstall/config and non-upstream updater; Android preview applicationId suffix and build-run version stamp; PowerShell preview packaging and installer smoke-test variants; installation guide and fork README clarification.

**Release policy:** Code push triggers Windows+Android build, full npm tests, Windows native and installer smoke checks, Android unit/lint and APK verification. A GitHub prerelease with two binaries and SHA256SUMS/BUILD-INFO is created only when both jobs succeed. Tag incorporates base version, run number and source Git SHA. Docs-only commits do not rebuild. Preview binaries remain unsigned/debug-signed; Android update across independent CI signing keys may require uninstalling old preview.

**Evidence and limits:** Source and workflow files committed. GitHub Actions might be disabled or jobs might fail; **no successful installable package or prerelease is claimed merely by committing this workflow**. No Windows installer, Android APK, or virtual Xbox gamepad was built inside this chat's tooling. Must inspect GitHub workflow results and actual download links before marking packaging verification done.

**Next:** Inspect Actions and fix build errors; validate both preview artifacts and installer smoke tests, then provide actual release links once GitHub generates them. Continue Windows virtual controller P2 in parallel; P8 Touchpad optimization remains deferred.

---

## 2026-10-23 — P2 read-only Windows XInput diagnostic (implementation)

**Branch:** `feature/universal-gamepad`; this change adds a standalone diagnostic, not a virtual gamepad implementation.

**Changed:** New `native/gamepad-probe/WinDock.GamepadProbe.csproj`, `Program.cs`, `README.md`: .NET 8 console tool that only calls `XInputGetState` to scan the four Xbox-compatible slots or watch button/axis/trigger changes for a fixed duration. New `scripts/verify-gamepad-probe.mjs` checks source-level no-installer/no-controller-emission invariants; `test/run.mjs` registers the oracle. Windows CI builds the console and runs its `--help` command with no driver operations. Updated driver feasibility plan, tracker and handoff.

**Tests:** The committed `scripts/verify-gamepad-probe.mjs` checks were executed in a sandboxed JavaScript evaluation of the current GitHub source with **19 assertions passed**, covering read-only XInput, .NET 8 project and lack of driver installation calls. **This was not a full Node/npm run.** C# has **not** been compiled on Windows or tested with real controller hardware. GitHub Actions API returned **0 runs** for the feature branch after this commit and no commit-status checks; full npm test/CI remains unverified. No driver installed, virtual Xbox created, UAC elevation, certificate trust change or manual test performed.

**Next:** Run full npm/CI, perform P1 visual/manual Android checks, then on a safe Windows machine run `--scan` baseline and compare to a separately vetted/approved driver demonstration; capture XInput and rollback evidence. P2 gate remains open.

---

## 2026-10-23 — Open-source research + deferred Touchpad latency phase (documentation only)

**Changes:** Added [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md), reviewing PhonePad, PadConnect Android/Receiver, Custom-Controller, KaifCoding Virtual Gamepad, Dish Android/Satellite, and Phone-Controller against WinDock. Documented architecture patterns, authenticated UDP vs insecure variants, neutral watchdog, packet layout, double-deadzone effects, GPL/MIT/Apache licensing, driver and benchmark caveats, and exact integration map. Added [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md), scheduled **only after a working, tested Gamepad v1 completes P7**. Updated PROGRESS, roadmap, handoff and AGENTS guidance.

**Source evidence:** Read projects' public GitHub READMEs and available LICENSE/SECURITY/protocol/benchmark/architecture files, plus current WinDock `public/input-pad.js`, `src/input-hub.js`, `src/platform/input.js`, `native/win/Touchpad.cs`. Project performance values belong to their respective authors.

**Implementation:** Documentation/planning only. No external project source code or drivers imported; no modifications to Touchpad runtime, Android native gamepad, Windows virtual controller or input transport.

**Tests:** Not run for this documentation-only change. Previous mocked Gamepad UI test evidence remains as recorded below; full npm/CI/phone+PC timing unresolved.

**Next:** Complete P1 real-device/full-suite checks, P2 signed/distributable virtual XInput driver feasibility, and VS1 real Android one-stick+A path; later P3–P7 full Gamepad. **P8 follows only after Gamepad release**, not now.

---

## 2026-10-23 — Verified mocked mode switch and prepared Windows driver test gate

**Phase/status:** P1 preview code present, awaits full npm/CI + physical Android tests; P2 driver feasibility **research documented, hardware proof not begun**.
**Verified:** Executed the persisted `scripts/verify-gamepad-ui.mjs` source with the actual current `public/input-pad.js` in a mocked execution environment; **21 assertions passed**. It tested opening a Touchpad WebSocket, holding/releasing a simulated mouse drag, switching to non-networking Gamepad preview, returning to live Touchpad and accessing Signature. This is *not* a Node/npm test suite run or device test.
**CI:** GitHub Actions API for this feature branch returned **zero workflow runs** at check time. Not marked passing; fork Actions enablement needs checking.
**Changed:** Created [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md), a strict safe-driver evaluation/rollback checklist, candidate research, and go/no-go criteria. Updated live tracker.
**Next:** Verify P1 on actual Android and through full `npm test`, then run P2 standalone proof on controlled Windows without silently elevating Node or installing unapproved certificates.

---

## 2026-10-23 — Persisted functional Gamepad mode-switch regression oracle

**Phase/status:** P1 code integrated, **not yet verified by full npm/CI or on an Android phone**.
**Changed:** Added `scripts/verify-gamepad-ui.mjs` with a mocked DOM and WebSocket to execute WinDock's actual `public/input-pad.js` selection code and assert safe exit/reentry, release of held mouse buttons and continued Signature navigation. Wired it into `test/run.mjs` so normal `npm test` will execute it.
**Evidence:** Equivalent standalone mock executed against the committed source through GitHub integration and **passed 16 behavioral assertions**, including Touchpad → Gamepad → Touchpad, release on switch, reopening live input and Signature.
**Tests:** The full `npm test` suite and physical Android/PC tests are **not run** in this environment. An equivalent in-process smoke test passed; the newly persisted Node oracle is not yet CI-confirmed.
**Next:** Run feature branch suite in a native checkout or Actions; continue P2 virtual controller proof-of-concept research; test UX in Android WebView.

---

## 2026-10-23 — P1 Gamepad preview integrated into Touch & sign (code change)

**Branch:** `feature/universal-gamepad`
**Phase/status:** P1 implementation committed; automated and physical-device verification pending; P2 driver proof not started.
**Changed:**
- `public/index.html`: third Gamepad tab, fullscreen Touchpad Gamepad shortcut, in-mode Touchpad return button, visibly noninteractive schematic controller preview.
- `public/input-pad.js`: explicit Gamepad mode, clean Touchpad disconnect/release on switch, no gameplay socket or host API requests for preview.
- `public/style.css`, `public/icons.js`: gamepad icon and responsive near-black preview consistent with WinDock.
- `public/sw.js`: cache namespace bumped so older HTML/JS isn't kept by installed PWAs.
- `scripts/verify-pwa.mjs`: static test assertions for navigation DOM and explicit preview-only behavior.
- `.github/workflows/ci.yml`: enable existing CI on feature-branch pushes in this fork.

**Tests:** Fixed a static assertion that mistakenly searched for `socket.send` instead of the existing `previous.send` release call. Source-level consistency checks performed; **`npm test`, GitHub CI results, Android UI and physical-game tests have NOT been confirmed yet**. See PROGRESS for acceptance gate. Do not claim working gamepad input.

**Next:** Check feature-branch CI status and run `npm test`; manually verify the UI on Android; then continue P2 driver/XInput proof-of-concept safely.

---

## 2026-10-23 — Critical product and engineering plan audit (documentation only)

**Phase/status:** P2 backend feasibility spike and P1 thin UI shell are next in parallel; P0 remains complete. Added [AUDIT.md](AUDIT.md) with driver feasibility, .NET 8/10 incompatibility, administrator/certificate trust, virtual-device licensing, reliability, pairing, UI interaction, and performance-risk findings. Updated [PROGRESS.md](PROGRESS.md) with VS1 minimum playable gate and decision checklist; updated developer handoff instructions and roadmap priority.

**Source review:** GitHub fork code and project docs; external HIDMaestro, libvirtualhid and ViGEmBus documentation. External SDK/driver performance claims have **not** been independently reproduced.

**Tests:** Not run (planning/docs only). No Windows virtual device installed, no Kotlin app built, no controller test, no physical device latency measurement.

**Blocked or uncertain:** Chosen signed/redistributable virtual controller backend, driver installation privileges/certificates, viable .NET integration and actual game compatibility remain unresolved, **not failed tests**.

**Next:** P2 isolated safe Windows virtual Xbox feasibility spike + P1 minimal Touch & sign integration in parallel; then VS1 real-phone one-stick+A test before full layout editor or UDP work.

---

## 2026-10-23 — Project tracking initialized (documentation only)

**Change:** Created canonical phase-by-phase [PROGRESS.md](PROGRESS.md) (P0–P7) and this chronological log, added links and required-update policy to `AGENTS.md` and `00-START-HERE.md`. Existing plans and UI screenshot contact sheet already existed in the feature branch.

**Verified:** The fork, `feature/universal-gamepad` branch, and these existing files were read from GitHub before writing: `docs/gamepad/00-START-HERE.md`, `docs/gamepad/UI-REFERENCE.md`, `docs/gamepad/assets/current-ui-screenshots.webp` (repository tree), `public/index.html`, `public/input-pad.js`, `public/style.css`, and `.github/workflows/ci.yml`.

**Implementation status:** No Gamepad code, native Android controller, virtual Windows device or network transport has been implemented as part of this worklog entry.

**Tests:** Not run (documentation-only commit). No real hardware/latency measurements.

**Next:** P1: Introduce Gamepad as a third UI-only mode within existing `#input-pad`, direct Touchpad ↔ Gamepad navigation, accurate "preview only" label and regression tests. In parallel, plan P2 driver feasibility research before committing to a virtual-device stack.

**Blockers:** None for P1; virtual Windows driver license/installation feasibility not yet determined.

---

## Worklog entry template (copy for each future development batch)

```markdown
## YYYY-MM-DD — Short description

**Branch / commit:** `feature/universal-gamepad` / `SHA or PR`
**Phase/status:** P# / IN PROGRESS, BLOCKED, or DONE
**Changed:** Source files and behavior.
**Evidence:** Relevant screenshots, tests, Windows controller detection or reproducible steps.
**Tests:** Commands executed + pass/fail (or explicitly not run and why).
**Decisions:** Changes in scope/architecture, with rationale.
**Open issues / blockers:** Specific observable problems.
**Next:** The next concrete incremental task.
```
