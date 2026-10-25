# WinDock — Monday, October 26, 2026 handoff: M0 fake lab v3 failure and v4 repair

> **Read this first.** On branch `feature/universal-gamepad` and repository `Farzansayeed/WinDock`, this is the active tomorrow handoff. Read current root `AGENTS.md`, `docs/gamepad/NEXT-SESSION.md`, `PROGRESS.md`, `WORKLOG.md` and `ARCHITECTURE-OWNERSHIP.md`. Do not let older v46/P2 handoff notes override current personal local fake-lab M0. No user testing or installations are requested in the closing 2026-10-25 chat.

## Owner's physical field evidence — NOT PASS

- **v1 fake release** `gamepad-m0-fake-lab-g2c3fa3a`: Windows fake receiver and Android separate LAB startup and PIN pairing proved, then repeated C# ready -> disposed; no stable A/stick.
- **v2 private artifact** `0080d200`: server `phone-disconnected`, `heartbeat-timeout`, `invalid-or-expired-frame` and some fake stick move/center events. Android native overlay occasionally exposed a second browser-only Gamepad pane on exit.
- **v3 private artifact** source `27f72e44a360bb62e4ca605ebfdd47a860adbcb0`, successful CI [#40215690132](https://github.com/Farzansayeed/WinDock/actions/runs/40215690132), matching artifact [#40215690225](https://github.com/Farzansayeed/WinDock/actions/runs/40215690225). Owner tried v3 on physical LAN; console reported:
  - `LAB SESSION: reason=first-frame-timeout ready=false accepted=0 active=0`.
  - `LAB SESSION: reason=heartbeat-timeout ready=true accepted=19 active=11` (and fake stick movement reached Windows).
  - `LAB SESSION: reason=native-receiver-stopped ready=true accepted=1 active=0`; another with `accepted=5 active=0`.
  - C# fake receiver starts and disposes repeatedly. Stable connection and reliable controller input **FAILED**. No final Ctrl+C summary evidence was provided. Do NOT log owner's private LAN IP, PIN, cookie or raw frames.

**Previously accepted, never need repeating**: Windows fake server startup, distinct debug Android LAB app install, LAN pairing; older regular Windows Preview, Android v25/v40/Phase A/XInput baseline checks. New behavior (stable connected session, fake A/stick reports, exit/summary) is genuinely unverified.

## Source fix developed 2026-10-25 (commit on feature branch; verify exact SHA)

Root cause *candidate proved by code*, NOT physical proof: the Node hub called `sink.write(neutralGamepadState())` on construction even for `scripts/lib/native-gamepad-fake-bridge.mjs`. The C# `ControllerReceiver` constructor already performs initial `seq=0` all-neutral output and native bridge verifies that before its `ready` message. Node's redundant initial stdin neutral starts the C# 180ms ACTIVE-INPUT lease **before Android has received ready ACK**, causing early expiry independently of the later 1000ms first-phone-frame limit.

Changed:
1. `scripts/lib/native-gamepad-fake-bridge.mjs`: verified fake child exposes `nativeStartupNeutral: true` with asynchronous native readiness. It still validates initial neutral seq=0 and fake-ready v1 before granting ready.
2. `src/gamepad/hub.js`: omits ONLY this exact fake native child's redundant pre-ready neutral; **all ordinary sinks** still require initial neutral; every closure still tries final neutral and cleans up.
3. `scripts/verify-gamepad-readiness.mjs`: synthetic native-neutral/ready ACK test verifies no early host stdin write and neutral on closure.
4. `scripts/test-gamepad-bridge.mjs`: *real Node authenticated WS -> C# child* delayed first phone input after 250ms (>180ms), keepalive every 35ms for >700ms; asserts fake sink stays alive during reports but expires after traffic stops.
5. `scripts/verify-gamepad-native-ipc.mjs`: asserts C# child's startup neutral ownership flag after real fake child ACK proof.

**Unchanged**: native independent 180ms fail-neutral watchdog, separate native/Node 1000ms first-frame limits, Android 40ms full-state heartbeat, strict PIN/cookie/Origin and same-LAN authorization, bounded queue/sequence, single WS owner and teardown quarantine, production `/gamepad` **HTTP 503**, ordinary Preview app. No physical Xbox/XInput controller, real driver, vendor binary, elevation/certificate modification, licensing/purchase, bypass, public release, cloud or merge to main. Don't loosen timeout to make a test pass.

## CI/artifact handoff

Last VERIFIED before v4 code: v3 artifact run #40215690225 passed and v3 exact source CI #40215690132 passed; **v3 physical field trial FAILED**. A new one-shot **private GitHub Actions artifact only** v4 workflow `.github/workflows/gamepad-m0-lab-v4-artifacts.yml` should build matching `WinDock-Gamepad-M0-LAB-v4-Windows-x64.zip` and `WinDock-Gamepad-M0-LAB-v4-Android.apk`, checked against build info/checksums, artifact `M0-FAKE-LAB-v4-matched-downloads`. No GitHub Release. Its trigger requires the exact commit prefix `build(gamepad): package native-neutral M0 v4 fake lab artifacts only`. **Verify actual GitHub head, exact-head CI and artifact existence before claiming completed; this paragraph does not assert success.** If source/test fails, diagnose specific job logs, preserve 180ms and 1000ms limits, fix and note in both trackers.

## Tomorrow's workflow for the assistant

1. Retrieve GitHub branch `feature/universal-gamepad` HEAD and top of `AGENTS.md`, current `NEXT-SESSION.md` and this handoff; inspect changed source and latest branch CI statuses (Windows, Linux, macOS, Android, required aggregate). Do not ask owner for the repository, old screenshots or prior accepted checks.
2. Verify any **matching** v4 private artifact success/source SHA/filenames/date. If missing or failing, fix **code or test**, commit appropriate PROGRESS/WORKLOG updates and rerun private CI artifact as permitted; no automatic regular/public Preview release. Do not invent download URLs/assets or claim passing CI before seeing results.
3. If ready **after owner next initiates testing**, give exact v4 artifact and filenames IN CHAT, and clearly instruct only replacing old fake Windows ZIP and Android LAB APK as genuinely necessary. No need to repeat earlier accepted pairing/installation as an acceptance checkpoint.
4. Ask owner only for new, unaccepted physical facts: can fake LAB stay connected idle for ~10 seconds after ready; do A press/release and stick move/center appear reliably; does Touchpad return without second UI flash; do Ctrl+C local-only counters and host p50/p95/p99 print. If failed, ask fixed Android status text, host `LAB SESSION` reasons and redacted counts **without IP, PIN, cookies or raw input**. Native watchdog still 180ms, never bypass security. These are future checks, not tonight.
5. If physical v4 still fails, do not infer the cause from a single `native-receiver-stopped`: investigate independent remaining Android/WS scheduling gaps via bounded, sanitized aggregate diagnostics and deterministic fake receiver tests. No real backend/gameplay claim. Document measured vs assumed before M1/M2.
6. Record actual verified outcomes in `PROGRESS.md`, `WORKLOG.md`, `NEXT-SESSION.md`, `ARCHITECTURE-OWNERSHIP.md` and update this dated handoff. Older full roadmap `PRIVATE-MULTIPLAYER-ROADMAP.md` remains in force.

## Last owner's instruction

> Do whatever safe code/document updates are needed now, update files correctly, and provide a prompt that can be pasted in a new chat tomorrow. **No more physical testing, installations or troubleshooting tonight.** The owner intends to close this chat.

The assistant must respect this: no more owner actions in the closing chat, no repeat of accepted checks, no real driver or privilege requests. Focus on clear resumed workflow and honest verification.
