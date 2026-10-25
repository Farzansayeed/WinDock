# WinDock gamepad architecture and file ownership

**Verified snapshot: 2026-10-25 source branch feature/universal-gamepad.** This is a navigation guide for developers; it does NOT assert that physical Xbox/XInput gameplay, multiplayer or Android socket wiring exists. For current priorities, see [PRIVATE-MULTIPLAYER-ROADMAP.md](PRIVATE-MULTIPLAYER-ROADMAP.md).

| Subsystem / source | Responsibility today | Boundary / next planned step |
|---|---|---|
| android/app/src/main/java/com/windock/app/GamepadTouchView.kt and GamepadTouchModel.kt | Native phone touch control and state modeling | UI does not decide Windows controller ownership |
| Android GamepadFrameEncoder.kt | Versioned whole-state encoder | Maintain exact field parity with src/gamepad/protocol.js and C# state parser |
| Android GamepadInputSession.kt | Sender heartbeat, immediate A edge, bounded analog cadence and neutral on close | No arbitrary socket or credentials inside input model; expand edge coverage only when actual controls are added |
| Android GamepadOwnerChannel.kt and GamepadSocketTarget.kt | Session handshake, origin/host validation modeling; socket must be supplied | **Does not itself open a live socket**; M0/M1 create a native adapter using existing authenticated pairing |
| android/app/src/main/java/com/windock/app/MainActivity.kt | Existing app/WebView lifecycle | Connect gamepad mode without forcing Touchpad/Signature regressions |
| server.js and existing authentication/sync utilities | PIN pairing, HTTP/WebSocket host and origin/cookie checks | Keep auth server-side; never rely on phone-provided slot or identity claim alone |
| src/gamepad/protocol.js | Validate strict versioned v1 256-byte max reports and neutral/watchdog lease | No network or hardware code in protocol; version any multi-slot envelope separately |
| src/gamepad/hub.js | **One** authenticated owner, timer and sink lifecycle, quarantine on uncertain native close | M0 defines seat-manager interface without enabling multiple owners prematurely |
| scripts/lib/native-gamepad-fake-bridge.mjs | CI-only persistent .NET child IPC, no driver | Do not import into production code or confuse fake report with Xbox |
| native/gamepad-sidecar/Program.cs | Fake sink and bounded stdin input, independent safety timer | Add approved backend interface behind separate opt-in exact-version adapter later |
| native/gamepad-tests/GamepadReceiver.cs / GamepadState.cs | .NET lease/parser and neutral-on-dispose ownership | Future per-player receiver must remain isolated, not global |
| scripts/test-gamepad-sidecar.mjs and test-gamepad-bridge.mjs | Windows fake-child tests, paired WS and EOF/watchdog cases | Existing v45 timeout-sensitive assertion: diagnose via deterministic barriers, not by weakening timeout |
| scripts/verify-gamepad-cleanup-containment.mjs; verify-gamepad-hub.mjs; verify-gamepad-readiness.mjs | Fail-closed and owner lifecycle regression | New multiplayer tests must retain current one-owner tests as legacy compatibility checks |
| docs/gamepad/PROGRESS.md; WORKLOG.md | Evidence of status and chronological changes | Update with every meaningful code commit; never invent field results |
| docs/gamepad/PRIVATE-MULTIPLAYER-ROADMAP.md | Scope, priorities, performance and concurrency acceptance | Update when a target is revised, distinguish targets from measured results |

## Existing transport / target integration

**TODAY — validated only in test harness:**

    Android Kotlin input/session models (not wired to live WS)
    Node paired WebSocket /gamepad single owner (production 503)
    C# fake sidecar with native watchdog (lab only)
    No driver / no playable Xbox controller

**TARGET — not yet built:**

    Native Kotlin sensor/touch -> paired socket ->
      ControllerSessionManager -> per-player session epoch and bounded queue ->
      persistent per-player Windows receiver and native safety watchdog ->
      optional approved Xbox-compatible driver adapter ->
      actual Windows game

## Error and ownership contract

- One client holds one assigned seat; no shared mutable state between seats.
- Per-seat frame schema, sequence, epoch, heartbeat, timeout and final-neutral must be isolated and independently testable.
- Native process termination, authentication revocation, socket loss and invalid/replayed payload cannot revive old held input; do not acknowledge readiness before underlying receiver is ready.
- A teardown failure currently **quarantines the entire hub**, refusing new sessions. Do not narrow this in multiplayer until driver ownership and shared failure modes are proven.
- A stalled or malicious client may never block other players once multiplayer is implemented; reject per-seat queue/rate overflow.
- Current implementation cannot create an Xbox/XInput device; never label in-memory or C# fake sink "playing in game".

## Where to look first

- For UI/control changes: Android touch model/view, existing Input Session and its Android unit tests.
- For network connection: GamepadOwnerChannel, GamepadSocketTarget, paired server.js and src/gamepad/hub.js.
- For wire compatibility: Android FrameEncoder, src/gamepad/protocol.js, C# GamepadState.cs.
- For safety: Android InputSession/OwnerChannel, JS hub, .NET GamepadReceiver and native-sidecar tests.
- For multiplayer: start with ControllerSessionManager design and independent fake sessions; never mutate the global owner into a shared array without isolation tests.
- For backend approval: P2-SIGNING-ROLLBACK-PLAN.md, P2-PHASE-A-DECISION.md; review exact vendor security/rollback terms separately.

**Code hygiene rule:** Keep this file aligned with source locations. When moving/renaming a file, update links and search for its references and obsolete tests. Do not delete historically used verification or relax safety assertions just to make CI pass.

## M0a telemetry and release workflow, 2026-10-25

- `src/gamepad/timing.js`: bounded opt-in host-only monotonic software timing; `src/gamepad/hub.js` emits samples to injectable `onTiming` after validated snapshots; `server.js` exposes only a programmatic `gamepadHubTiming` dependency for lab tests (normal production default null).
- `scripts/verify-gamepad-timing.mjs`: paired socket + in-memory sink and bounded stats gate. Do not interpret software output timings as Wi-Fi RTT, actual XInput, or in-game input responsiveness.
- `.github/workflows/gamepad-preview.yml`: manually triggered only and publish job explicitly disabled to respect personal prototype **no publication**. `.github/workflows/ci.yml` remains branch-push verification.

## M0b native Kotlin paired WebSocket and CI (2026-10-25)

- `android/app/src/main/java/com/windock/app/GamepadPairedWebSocket.kt`: one-owner OkHttp WS adapter with exact same-origin Cookie and ready/neutral logic; can be wired to Activity in M0c only after tests.
- `android/app/src/test/java/com/windock/app/GamepadPairedWebSocketTest.kt`: real local MockWebServer test and invalid-cookie tests.
- `.github/workflows/ci.yml`: explicit fourth Android unit/lint job; `CI passed` now requires Android as well as Windows/macOS/Linux. No APK release job or signing secret read.

## M0c Android debug action

`MainActivity.kt` connects GamepadTouchView to its own GamepadPairedWebSocket only upon explicit DEBUG-only paired LAB button, with 10ms `tick()` on UI and idempotent neutral/close on pause, navigation or Activity exit. Neither the production server nor Android creates or installs any driver. The live Windows fake-lab launcher is a separate owner-invoked step.

## M0d manually run fake lab and native CI synchronization

- `scripts/gamepad-fake-lab-server.mjs`: explicit Windows CLI with private IPv4 only, ephemeral config, normal PIN pairing and `.NET` FAKE sink only; not started by normal WinDock or background workflow.
- `scripts/test-gamepad-sidecar.mjs`: direct Windows .NET child test prequeues first A bytes to stdin before child starts reading (native constructs neutral + emits `ready` before read), avoiding a Windows stdout callback scheduling flake. Strict real WS-bridge ACK-before-frame remains independently verified in `scripts/test-gamepad-bridge.mjs`; native first-frame 1000 ms and active watchdog 180 ms are unchanged. Continue testing replay, timeout, invalid and EOF.

## M0f independently installable Android debug lab

`android/app/build.gradle` chooses separate `com.windock.app.gamepadlab` and `WinDock Gamepad LAB` label only when the Preview-version property is absent. `android/app/src/main/AndroidManifest.xml` uses a Gradle-supplied label placeholder. Existing signed Preview property keeps `.gamepadpreview` and the normal `@string/app_name` label, and regular release remains unchanged. `.github/workflows/ci.yml` builds the actual ordinary debug APK and uses Android SDK `aapt` to assert package identity and label; no release or signing secret access. Kotlin Gamepad transport/auth and native watchdog unchanged; installing a new debug app is NOT proof of physical Android/Windows interoperability.

## M0e private fake lab observability (2026-10-25)

- `scripts/lib/gamepad-lab-observer.mjs` counts fixed categories of C# **fake** receiver events and prints at most 16 redacted notices. It does not save individual frame values, address, pairing cookie/PIN, per-frame timing or player identity. Its pure Node regression `scripts/verify-gamepad-lab-observer.mjs` is included in `npm test`.
- `scripts/gamepad-fake-lab-server.mjs`, which must be explicitly launched on Windows/private IPv4, injects this observer into the existing fake native bridge. It also opts into the preexisting `createGamepadTimingWindow(256)` metric and prints only aggregate host processing p50/p95/p99/max on Ctrl+C.
- Production server and Android release remain unchanged. These host timings do **not** measure Android↔PC network RTT, cross-process wall-clock one-way latency, genuine Xbox/XInput submission, or gameplay. See [M0-LAB-TESTING.md](M0-LAB-TESTING.md).

## M0 physical lab failure — Android sender scheduling (2026-10-25)
Android GamepadPairedWebSocket.kt now owns 10ms tick executor for the 40ms resend, instead of Android MainActivity.kt using View.postDelayed. Stops executor when socket closes. Native independent 180ms watchdog and startup 1s unchanged; no production backend, real Xbox, or driver. Old g2c3fa3a APK does not include source repair; field re-test pending.

## M0 private fake-only session termination metadata
src/gamepad/hub.js accepts optional onLifecycle with fixed reason and capped accepted/active frame counts; server.js plumbs it and scripts/gamepad-fake-lab-server.mjs alone enables text notices. Normal production does not enable logging. Test uses actual Node/auth/WebSocket/C# test sidecar, no native timer/driver/pairing changes. Field proof pending.


## M0 v2 failed physical session — diagnostic/dual-UI update

**2026-10-25 M0 v2 PHYSICAL FAILURE, diagnostic v3 pending:** Owner installed and paired v2 on the same LAN (previous setup PASS); Windows C# fake sink reached READY but sessions ended as phone-disconnected accepted=0, heartbeat-timeout accepted=3 or 9, and invalid-or-expired-frame accepted=1. One fake stick-move and center was observed, not reliable A/continuous output. Exit also flashed a second, web-only gamepad view beneath the native Android view. v3 corrective scope: register native OkHttp wire in onOpen before fast ready callback; show bounded precise server-owned close reason (PC no frames / late / invalid / native fault) once on phone, detect Android 120ms scheduling gap diagnostically (not a deadline change), and keep underlying Android web mode Touchpad while native overlay is active. Preserve web/PWA Gamepad preview. Windows sends only fixed reasons to paired socket, distinguishes invalid from late. Add real Android MockWebServer reason test and Node UI/auth/close tests. **Root cause of heartbeat interruption still UNKNOWN until owner v3 hardware test; do not claim fix from CI alone.** Native 180ms fail-neutral and 1s first-frame deadlines, 40ms Android reports, single-owner PIN/cookie/origin, production /gamepad HTTP 503 unchanged. No driver, HIDMaestro binaries, privileges, certificate trust or purchases, no new public GitHub Release, no main merge; only one-off private Actions artifacts after tests pass. Prior accepted Windows start, isolated Android install and pairing, plus older hardware/Preview checks must NOT be repeated.


## M0 source handoff 2026-10-25 — verified startup neutral vs active lease

**2026-10-25 V3 OWNER PHYSICAL FAIL / V4 HANDOFF (NOT A FIELD PASS):** Owner's v3 Android/Windows private fake LAB previously paired and produced some FAKE left-stick events, but Windows showed `first-frame-timeout ready=false accepted=0`, `heartbeat-timeout ready=true accepted=19 active=11`, and `native-receiver-stopped ready=true accepted=1` / `accepted=5`. Sustained inputs, A press/release and Ctrl+C counters NOT owner-accepted. Source inspection identified a concrete possible contributor: `src/gamepad/hub.js` sent a redundant initial neutral stdin frame before native ready ACK. The C# fake sidecar ALREADY constructs/emits verified all-neutral seq=0; that extra frame prematurely started its independent 180ms ACTIVE lease before phone authenticated first report. Fake bridge now advertises `nativeStartupNeutral:true` with verified async native ready; hub skips only that redundant pre-ready write, still initializes all ordinary sinks neutral, neutralizes on cleanup. Added delayed-first-input 250ms plus sustained 35ms stream >700ms real authenticated WS -> C# test, in-memory readiness test and native IPC proof; native 180ms fail-neutral / 1000ms first-frame deadlines unchanged. Potential remaining phone/Wi-Fi scheduling gaps still UNPROVEN until future user trial; no Xbox driver or true RTT. Owner explicitly requests NO MORE OWNER TESTS OR INSTALLATIONS in this closing chat; tomorrow's assistant should inspect exact-head CI/private v4 artifact and only then give inline minimal instructions when owner is ready. DO NOT repeat accepted PC startup, Android install/pair, previous Preview/XInput/Phase A tests. No release, driver, signing secrets, elevation, trust changes, main merge.

The distinction is crucial: C# fake `ControllerReceiver` constructor emits an already-verified neutral report before its v1 ready ACK, while an extra Node stdin neutral previously started the 180ms active timer before Kotlin got the ACK. New `nativeStartupNeutral` source contract avoids that early frame only for this fake child; future real/ordinary sinks still get startup neutral. See [active handoff](HANDOFF-2026-10-26-M0-FAILURE.md). Real Android physical v4 has not been verified.


## Verified October 26 resumption state

**VERIFIED v4 DELIVERY (2026-10-25):** Source `3a5b1a3d1736503d192347fd3d567027f5d3e988`. All five [CI #40221419569](https://github.com/Farzansayeed/WinDock/actions/runs/40221419569) jobs SUCCESS, all three [private build #40221419485](https://github.com/Farzansayeed/WinDock/actions/runs/40221419485) jobs SUCCESS. Artifact `M0-FAKE-LAB-v4-matched-downloads` (ID 12609790538; expires 2026-11-08 18:31 UTC) includes matching `WinDock-Gamepad-M0-LAB-v4-Windows-x64.zip`, `WinDock-Gamepad-M0-LAB-v4-Android.apk`, SHA256SUMS.txt and BUILD-INFO.txt. Docs-only commit after this code may move branch HEAD; artifact stays linked to source `3a5b1a3`. NO GitHub Release, no signer, no driver, no owner test tonight; owner v3 physical FAIL and new v4 physical still UNVERIFIED. v4 code is driver-neutral, native 180ms watchdog and 1000ms startup remain unchanged. Don't repeat accepted setup/pairing/XInput baseline. Exact next-user steps are in [handoff](HANDOFF-2026-10-26-M0-FAILURE.md), but explain them in the chat, do not require user to read files.
