# WinDock — private-first, low-latency and multiplayer development roadmap

**Decision recorded: 2026-10-25. Scope:** personal use by the owner and a few friends, NOT a public release, upstream merge or commercial package. Owner explicitly wants scalable, understandable, maintainable code; a natural-feeling phone gamepad; low-end Android performance close to high-end *where hardware permits*; and future simultaneous multiplayer on one Windows host. No installation, download or execution of vendor driver binaries, elevation, certificate-trust change, licence purchase or security bypass is authorized by this planning request.

**Single source of truth for current priorities.** Older numbered P1/P2/VS1/P7/P8 notes are historical plans and should not override this document; retain prior accepted evidence and safety constraints. Branch remains feature/universal-gamepad. Production /gamepad remains HTTP 503; published v46 is NOT a playable Xbox device. The owner accepted v45 Phase A decision and previously accepted physical Windows baseline, Android v25 and v40 audit; never request those tests again.

## What is first — next implementation checkpoint: M0

**M0: establish a measured, driver-neutral one-phone transport baseline and a clean multi-session seam.** Implement in small independently tested commits rather than inserting a driver now.

1. **Inventory + clean seam.** Write a simple ownership and lifetime diagram for Android GamepadOwnerChannel/GamepadInputSession, authenticated Node gamepad hub, native helper, and the virtual device adapter. Define the proposed SessionManager / ControllerSlot boundary without changing the currently safe single-owner behavior. No magic globals or shared mutable controller state.
2. **Fix test reliability before claiming speed.** Investigate v45 Windows fake-sidecar A-press timing flake. Use deterministic events/barriers and fault diagnostics where possible; DO NOT enlarge the native 180ms fail-neutral lease merely to hide CI flakiness. Keep EOF/crash/invalid/replay test cases mandatory.
3. **Measure what is measurable without a driver.** Add opt-in local, redacted capture of one-way app queue timings and Windows receiver processing; use a monotonic clock per process and ping/pong RTT for phone↔PC because different clocks do not directly support true one-way timing. Collect p50/p95/p99, max, packet age, gaps, loss/reconnect and stale/neutral events. No cloud, per-user tracking, IP/token logging or telemetry; disabled by default. Label fake-sink measurements as transport-only, not input-to-XInput/game latency.
4. **Connect the real Kotlin session to the authenticated WebSocket in a restricted lab pathway** only after reviewing actual WebView origin/cookie pairing, Android lifecycle and non-blocking touch path. No external service, raw PIN in logs or hard-coded authorization. Keep production device backend disabled. Validate phone UI↔Node↔C# fake output, even if real Android physical trial is a separate later check.
5. **No premature transport rewrite.** Benchmark the existing WebSocket vs USB tether using a controlled workload. Only prototype authenticated native UDP if measured p95/p99 gains justify added crypto/replay/disconnect complexity.

**M0 deliverable and acceptance:** a documented file map, reproducible no-driver automated tests and safe latency tracing, a paired-phone-to-fake-output integration path with strict honest PASS/NOT TESTED statements, and a stable one-owner baseline that a future multi-slot manager can wrap. Verify no session leak on disconnect, background, stale sequence, lost device, fault and cancellation. The physical Android-path acceptance is not presumed passed.

## Future milestones and hard gates

| Milestone | What to build | Exit criteria / dependency |
|---|---|---|
| M1 — single player driver-neutral | Kotlin MotionEvent controls to authenticated local host and persistent native fake receiver. No per-frame process spawning, bounded queues, separate native timeout | One full-state one-stick+A path, no stale-held inputs, independent failure injection tests; production virtual device still disabled |
| M2 — optional HIDMaestro personal lab trial | Exact pinned-version vendor signing, prerequisites, third-party terms, USB filter ownership, revert plan; then *separately approved* binary acquisition/read-only verification and separately approved Windows trial | Explicit owner authorizes exact release, driver/cert/admin changes only after informed risk + rollback review. Windows must actually expose a new XInput slot and work in a game. No silent certificate trust or bypass; if conditions rejected, remain fake-only |
| M3 — measured single-player realism | Latency/jitter and touch ergonomics on at least low- and high-end representative phones, 5 GHz Wi-Fi, and optional USB tether; controlled 60 FPS or known test game | Actual finger-to-controller/game performance and tails measured, reproducible test protocol, no dropped button release; compare transport variants before changing them |
| M4 — multi-session protocol and scheduling | One authenticated owner per controller slot, separate sequence/epoch, receiver/lease/neutral watchdog, per-slot backpressure and lifecycle; slot reservation/reconnection policy | Concurrent two-client fake-driver test first; one player cannot manipulate, starve, steal or revive another slot. Clean per-player disconnect. No new live driver assumed |
| M5 — real multiplayer on Windows | Up to four **target** local controllers if backend/OS/game support it (conventional XInput slots 0–3), backed by verified native device instances, no accidental slot swap or cross-player buttons | Physical two-phone gameplay plus disconnect/crash/timeout and slot reuse, then three/four if hardware supports; any shared backend failure quarantines affected scope (possibly whole hub) |
| M6 — accessible natural-feeling controls | Floating/fixed stick choice, dead zones, response curves, larger targets, draggable/resizable layouts, local profiles, responsive tap/drag, optional per-phone performance mode | Low-end responsiveness and battery use within measured budgets; no forced 120 Hz or extra smoothing. Existing Touchpad/Signature remain intact |
| M7 — personal/friends install polish | Reversible optional backend setup documentation, permission UI, versioned isolated Preview, compatibility and recovery guides | No unattended installer or unsigned-driver trick; friends count as external recipients for third-party redistribution licences. No public distribution or main-branch merge without new request |
| M8 — optional broader release | Audit licence, installer signing, consent, error handling and support costs only if user later wants public shipping | Explicit scope change; never infer it from a private prototype |

**Parallel, every milestone:** maintainability / tests / documentation / latency & robustness. Don't postpone code clarity to the end. The real Xbox backend is a critical path for gameplay, but independent networking and multi-session safety may be built and tested first.

## Architecture target (not yet implemented)

**Current reality:** Node src/gamepad/hub.js owns exactly ONE WebSocket, one sink, one timeout gate; asynchronous/synchronous close failure quarantines the hub; production sinkFactory is absent (HTTP 503). The standalone Kotlin GamepadOwnerChannel and GamepadInputSession specify an authenticated socket adapter but do not by themselves open a live socket. The .NET fake sidecar is a test sink, not a virtual Xbox device.

**Target architecture:**

    Kotlin MotionEvent / UI
      -> per-phone GamepadInputSession / bounded transmitter
      -> paired LAN WebSocket (later USB-tether over same IP route)
      -> authenticated ControllerSessionManager (max slots configured)
            -> per-player identity, session epoch, ordering, lease and rate budget
            -> controller slot 0..3 binding (only after backend confirms capacity)
            -> persistent per-slot native receiver + independent fail-neutral
                  -> backend adapter interface
                       -> Fake sink for CI
                       -> HIDMaestro isolated opt-in lab backend (NOT installed/approved)
      -> Windows XInput games (UNVERIFIED)

Keep module ownership explicit. The server's existing PIN/cookie/origin checks are the control boundary; a player may own only their assigned slot. Do not send client-supplied slot IDs straight to device APIs without authorization. Reconnect starts a fresh session epoch with sequence reset and neutral state, never inherits a held button. Capacity overflow returns a clear BUSY/FULL answer and allocates no device. Treat failed native close as quarantined, not free. A shared driver fault may require shutting down all slots safely. Every owner gets independent watchdog and counters; 4 controller target is NOT 4 simultaneously verified XInput devices.

## Performance requirements — measurable, not magical promises

- **No assumption of identical speed across phones.** Touch sampling, thermal throttling, network radios and refresh rate impose real limits. Target low-end parity in *software-added* latency and stability, compare like network settings and report hardware-related gaps rather than promise equality.
- **Key metrics:** input event-to-enqueue, queue-to-send, phone↔PC network RTT and jitter, Windows receive-to-fake-report, p50/p95/p99 and worst-case over sustained tests; then approved driver submission-to-XInput visibility and eventually finger-to-game visual latency. Never add unsynchronized phone and PC monotonic timestamps to assert true one-way time.
- **Initial benchmark targets (hypotheses):** on healthy LAN, RTT p95 < 10ms and Windows software receive-to-fake output p95 < 5ms; both require real measurements. Compare low/high Android tiers at the same 60Hz touch output where possible; aim at no > 5ms avoidable additional software delay p95 on low-end hardware, revising target from evidence. A full end-to-end < 30ms aspiration is not an achieved benchmark.
- **CPU/RAM/battery:** no per-frame JSON/object churn where avoidable, no expensive UI redraw on every packet, no per-frame native-process spawn, no unbounded logging/buffers, no busy-spin timers. Prefer event-driven button edges, latest-state coalescing for sticks, bounded transition queues preserving button releases, adaptive update rates based on real device capability and receiver capacity (e.g. 30/60/120 Hz only after measurement). A slower phone should lower analog cadence without making button presses wait.
- **Fairness under multiplayer:** fixed maximum active controller instances (start 2 in fake CI, target 4 after proof), per-player bounded queue and rate limit; one sender flooding cannot delay others or monopolize event loop. Watchdog based on each player's freshness, not the most recently active player. Disconnection of player 2 never neutralizes player 1.
- **Network modes:** prefer 5/6 GHz local Wi-Fi + Ethernet PC or optional USB tether, never require internet relay, account, online token validation or ADB for normal gameplay. Native UDP is a later measured experiment with proper authenticated key establishment; do not claim it is faster without an apples-to-apples p95/p99 test.

## Clean code / understanding policy for every future change

1. Each module gets **one clear job**: UI/touch model; Android transport/session; authentication; WebSocket routing; controller seat manager; protocol/validation; .NET native lease; backend implementation; instrumentation. Depend on narrow interfaces rather than concrete drivers. Explain failure semantics in docstrings.
2. Maintain [ARCHITECTURE-OWNERSHIP.md](ARCHITECTURE-OWNERSHIP.md), updated alongside changed owners/flows, with file ownership table, data flow, runtime modes and failure behavior. Avoid giant files that mix transport, UI and driver state; refactor in testable small commits.
3. No stale or broken code: audit changed areas for abandoned branches, unused exports, old protocols, stale docs and unreferenced tests. Remove only after reference search + tests, not based on guesses; preserve historical milestone records but mark history versus current. Do not mask failing regressions by deleting an oracle or relaxing watchdogs.
4. Public APIs and cross-language state contract must be versioned; no implicit shared globals or magic slot numbers. All failure paths are tested: early/late ready, duplicate, replay, overflow, timeout, invalid input, clock rollback, socket EOF, native crash, partial cleanup and restart.
5. Ensure code compiles and core tests run across Windows/Linux/macOS where relevant; Android tests and lint on actual affected Kotlin changes, native Windows fake-sidecar tests, Preview package tests when packaging changes. Never claim an unrun physical test passed. Commit PROGRESS.md and WORKLOG.md with each meaningful code change, record CI/Preview outcomes and checked owner acceptance.
6. No dead code just for speculative future features. Use a small interface and tests; add the concrete implementation only in the relevant milestone. Keep Linux/other WinDock features working, including Touchpad/Signature and existing pairing.

## Decisions not reopened without request

- Owner branch only, no merge or pull request into main/upstream.
- Personal/friends prototype scope; free/open-source preferred, no fees or cloud dependence for gameplay.
- HIDMaestro v2.0.3 is the **first conditional Windows virtual controller lab candidate**, not a chosen installed production component. Its self-signed certificate trust, admin requirements, .NET runtime prerequisites, shared usbip-win2/USB 3 root hub rollback hazards and unreviewed bundled third-party notices remain open. Local owner usage may simplify planned packaging, **but giving driver binaries to friends is still redistribution**; do not assume the MIT repo covers every bundled dependency.
- Approval to plan or proceed with driver-neutral code NEVER authorizes acquiring or executing HIDMaestro packages, driver installation, admin rights, certificate-trust updates, signing bypass or purchases. Future lab approvals must be explicit and specific.
- No haptics/rumble or gyro in v1. Touchpad P8 unrelated optimization remains deferred; gamepad path latency is a core requirement now.
