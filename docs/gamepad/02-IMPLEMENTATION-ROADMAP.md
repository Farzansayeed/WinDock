# Low-latency gamepad — architecture, phased implementation, security & gates

> **Progress note:** For current task checkboxes, status, blockers, verification evidence and next action, consult [PROGRESS.md](PROGRESS.md) and [WORKLOG.md](WORKLOG.md). The milestones below are a design roadmap, not a claim of completion. Update the tracker/worklog alongside every meaningful code commit.

## Architecture and isolation

```
Existing PC discovery / PIN pairing / normal dock:
  Android Kotlin shell ↔ Node host ↔ Windows provider

Gamepad setup/control plane:
  Trusted Android native session request ↔ authenticated Node API ↔ native Windows gamepad service

Gameplay hot path, preferred after benchmarks:
  Kotlin native MotionEvent + button state
    → bounded latest-state queue → sequenced compact UDP via trusted LAN / USB tether
    → persistent C# receiver → virtual XInput-compatible controller → Windows game

Baseline/fallback comparison:
  WebView/JS or native Android ↔ authenticated WebSocket → Node hub
    → persistent C# helper → virtual controller
```

Node.js itself is not proven the latency bottleneck; **measure both routes** before committing to extra UDP complexity. Native Android still offers direct MotionEvent multitouch and decoupled UI/network refresh.

Avoid copying the existing `src/input.js` mouse protocol for controller frames; new versioned and bounded `gamepad` protocol should have its own validator and worker. Maintain `src/platform/` separation and refuse unsupported platforms without impacting their other features.

## Protocol and lifecycle requirements

- Full coherent state snapshots: signed axes (two sticks, normalized/quantized), 0–1 analog LT/RT, button bitset (ABXY/D-pad/LB/RB/Menu/View/L3/R3), monotonic sequence, session epoch/version.
- Button down/up sent immediately; analog reports coalesced and paced (compare 60/120 Hz; don't assume phones support 120 Hz).
- Receiver drops out-of-order/expired/malformed/oversized packets and bounds input rate. One connected owner unless a future explicit multi-controller design is approved.
- Session negotiation requires current authorized pairing. UDP frames authenticated and bound to session; do not log pairing tokens, cookies, phone touch values, or session keys. Current LAN HTTP pairing is not eavesdrop-resistant—do not claim cryptographic secrecy without securing the key exchange first.
- Safe shutdown: on pointer up/cancel, screen lock, task switch, close, disconnect, focus loss, stale network packets or driver failure → **neutral controller report**; watchdog initially test 150–250 ms and tune based on measured behavior.
- Do not spawn C# or Node processes per packet; reuse resident device/receiver.
- USB mode means WinDock's existing Android USB tether networking; not ADB or direct HID over USB.

## Backend evaluation

- Start compatibility work with a virtual Xbox 360/XInput-class controller, since PC games commonly expect Xbox-compatible input. Confirm current driver support for Windows 10/11, signed installation/redistribution rights and maintenance state before bundling anything.
- ViGEmBus is archived/retired and must not be treated as a maintained default.
- Evaluate modern driver alternatives (e.g. HIDMaestro, libvirtualhid) independently for genuine device presentation, SDK stability, rights and security. Do not infer that an MIT repo makes its kernel driver installable/distributable.
- PlayStation button artwork/labels are skins. Genuine DS4/DualSense emulation is an independent backend feature; not required in v1.
- Linux gamepad device is later work; Linux existing touchpad remains intact.

## Phased milestones

1. **UI foundation:** implement third input mode/navigation inside Touch & sign, capability state and preview. All prior modes remain functional; browser-only preview explicitly **not a working PC controller**.
2. **Native Android v1:** layout model, multi-pointer input, local profiles, configurable group visibility/geometry, release behavior, unit/instrumentation tests.
3. **Windows controller service:** driver evaluation and virtual Xbox report integration, persistent service and neutral watchdog, direct Windows test harness.
4. **Pairing and transport:** authorized session start/stop, native Android ↔ PC updates over secure bounded LAN connection, compare WebSocket vs UDP, USB/Wi-Fi fallback.
5. **Validation and polish:** Windows Game Controllers / `joy.cpl`, Steam input tests, real games (where compatible), game focus transitions, CPU/battery and p50/p95/p99 measured processing latency, packet drop and reconnect tests, layout usability.
6. **Gyroscope** is explicitly *out of scope* until user approves after normal controls work. **Never add haptics.**

### Success conditions and testing

- 1-stick, 2-stick, D-pad-only and minimal custom layouts all work and save locally.
- Analog movement has genuine continuous value, not a hardcoded WASD conversion.
- Combined multi-pointer actions recognized and gracefully neutralized on leaving mode.
- Existing touchpad/signature/capture works after going in/out of Gamepad, including keyboard focus on phone.
- Real Windows game/virtual-device detection verified, not merely DOM events shown.
- Claim nothing about low latency until per-stage timestamps have been measured on physical phone and PC with separately stated phone hardware/game display limits.
- Baseline command `npm ci && npm test`, then Windows-native input tests and `npm run build:android` with supported SDK/JDK. Linux Rust tests should remain green if touched.
- Existing `.github/workflows/ci.yml`: on PR runs Linux npm/Rust, Windows npm/C# input/update, and macOS npm/native build where present, then `CI passed` aggregate. Pushes to **main** also trigger CI, but a feature-branch push alone does not trigger all jobs; run checks manually or through fork PR when appropriate.
- CI does not replace physical-device input/latency tests.

## Stop/go checkpoints for next developer

- Do not mark v1 complete until virtual device and Android native real input work together.
- Document Windows driver install/removal and failure modes; never ship unsigned/untrusted kernel binary without user-visible warning and tested rollback.
- Keep new code isolated; no secret material or screenshot attachments with credentials in commits.
- All changes on `feature/universal-gamepad` in `Farzansayeed/WinDock`; user does **not** request contribution upstream.
