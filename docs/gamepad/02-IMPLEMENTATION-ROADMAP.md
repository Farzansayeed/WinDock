# Low-latency gamepad — architecture, phased implementation, security & gates

**CURRENT PRIORITY REPLACEMENT — 2026-10-25:** [PRIVATE-MULTIPLAYER-ROADMAP.md](PRIVATE-MULTIPLAYER-ROADMAP.md) is the current ordered M0–M8 roadmap following the owner's shift to private personal/friends usage, low/high-end device scalability, multi-controller sessions and maintainable source. [ARCHITECTURE-OWNERSHIP.md](ARCHITECTURE-OWNERSHIP.md) tracks the real file map. The older phases below provide historical context and must NOT force a driver installation before driver-neutral M0 or permit any security bypass. HIDMaestro is an isolated first lab candidate only; permission to download/install/trust has NOT been granted.

> **October 2026 audit correction:** [AUDIT.md](AUDIT.md) identifies Windows driver feasibility as the first technical gate. Execute an isolated P2 driver/XInput proof **in parallel with a thin P1 Touch & sign UI-only preview**; **then VS1 one-stick+A real Android→Windows virtual gamepad proof** before polished layout editor/UDP optimization. Existing phase numbering reflects feature areas, not recommended strict sequential implementation. Start with authenticated persistent WebSocket baseline and measure; do **not** presume UDP is necessary. HIDMaestro currently targets .NET 10 with elevated device setup, unlike WinDock's .NET 8 helper; alternative licensed/archived backends also have constraints. No driver has been validated.

> **Progress note:** For current task checkboxes, status, blockers, verification evidence and next action, consult [PROGRESS.md](PROGRESS.md) and [WORKLOG.md](WORKLOG.md). The milestones below are a design roadmap, not a claim of completion. Update the tracker/worklog alongside every meaningful code commit.

**Status caveat:** This is a design roadmap. Current implementation and released-package evidence are in [SESSION-HANDOFF.md](SESSION-HANDOFF.md); signed v11 packages exist, but no working phone-to-Windows virtual Xbox controller. Read the live tracker before coding.

## Open-source comparative research and deferred work

- [Open-source phone gamepads: patterns, flags, licensing and integration](OPEN-SOURCE-RESEARCH.md).
- [P8 — Touchpad latency optimization, strictly AFTER Gamepad release](TOUCHPAD-LATENCY-P8.md).
- **Keep P1–P7 focused on Gamepad.** Audit external code/licenses before adapting; no source imported. PhonePad is the strongest packet/security/benchmark reference, while native Kotlin Custom-Controller and PadConnect offer UI ideas; validate the actual Windows XInput backend independently.

## Architecture and isolation

```
Existing PC discovery / PIN pairing / normal dock:
  Android Kotlin shell ↔ Node host ↔ Windows provider

Gamepad setup/control plane:
  Trusted Android native session request ↔ authenticated Node API ↔ native Windows gamepad service

Gameplay hot path, OPTIONAL after baseline benchmarking:
  Kotlin native MotionEvent + button state
    → bounded latest-state queue → sequenced compact UDP via trusted LAN / USB tether
    → persistent C# receiver → virtual XInput-compatible controller → Windows game

Baseline FIRST to implement and measure:
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
3. **Windows controller service (gate before full editor):** driver evaluation and virtual Xbox report integration, persistent service and neutral watchdog, direct Windows test harness.
4. **Pairing and transport (WebSocket baseline first; UDP optional only if demonstrated benefit):** authorized session start/stop, native Android ↔ PC updates over secure bounded LAN connection, compare WebSocket vs UDP, USB/Wi-Fi fallback.
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
- `.github/workflows/ci.yml` and the Gamepad Preview release workflow have been configured for and successfully run on `feature/universal-gamepad` code pushes. Check the current Actions configuration and results; [v11 CI](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) passed. Historical notes about only PR/main triggering CI are obsolete.
- CI does not replace physical-device input/latency tests.

## P8 — Follow-up ONLY after Gamepad P7 acceptance

Review the current Touchpad render-frame coalescing and persistent WebSocket/native helper pipeline after a proven Gamepad release, then baseline physical latency and optimize observed bottlenecks. Preserve relative mouse delta ordering and tap/drag release semantics. See [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md) for its gated checklist.

## Stop/go checkpoints for next developer

- Do not mark v1 complete until virtual device and Android native real input work together.
- Document Windows driver install/removal and failure modes; never ship unsigned/untrusted kernel binary without user-visible warning and tested rollback.
- Keep new code isolated; no secret material or screenshot attachments with credentials in commits.
- All changes on `feature/universal-gamepad` in `Farzansayeed/WinDock`; user does **not** request contribution upstream.
