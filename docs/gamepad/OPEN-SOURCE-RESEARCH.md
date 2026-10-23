# Open-source phone gamepads — comparative research, flags and WinDock integration

**Reviewed:** 2026-10-23 | **Status:** documentation/research, no external source copied, integrated, built or hardware-tested.  
**Fork:** [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock/tree/feature/universal-gamepad) | [Live tracker](PROGRESS.md) | [P2 driver gate](P2-DRIVER-FEASIBILITY.md).

## Purpose and decision

Research actual publicly available open-source Android-to-PC gamepad projects to accelerate **WinDock's integrated, selectable, local-first, low-latency Gamepad mode**, **without** replacing the existing WinDock APK/server, taking over the Touchpad, copying incompatible-licensed app code, or assuming software advertised as XInput/low latency actually passes our test suite.

**Recommendation:** Use **PhonePad** as the primary architecture/test-method reference; **Custom-Controller** as the Kotlin View + USB tethering reference; **PadConnect** as a Kotlin multitouch/layout reference; **Dish Android** as a stronger authenticated-stream/session reference; **KaifCoding** for tiny versioned packets and host discovery/failure UX; **Phone-Controller** as evidence that Node/WebSocket can be a valid baseline. Choose/validate a Windows backend independently (P2), then build minimum playable **VS1** before investing in full editor or UDP.

Read licenses before copying. A repository's MIT README does not make its dependencies or virtual Windows driver MIT, signed, free or redistributable.

## Project comparison — source-level claims unless explicitly verified

| Project (source) | Architecture and standout ideas | Documented or observed flags/gaps | License / reuse stance | WinDock integration |
|---|---|---|---|---|
| [MNBLabs/phonepad](https://github.com/MNBLabs/phonepad) | Android touch routing → full controller state → **40-byte authenticated UDP**, up to ~250 Hz → **Rust Windows** → ViGEmBus/XInput; on-change + repeat, 120 ms neutral watchdog, pairing/X25519/HMAC/replay, profile editor, response-curve tuning. [Benchmarks](https://github.com/MNBLabs/phonepad/blob/main/docs/benchmarks.md) describe developer-observed 4.9–8 ms **round trip**, not total touch-to-photon. | Depends on retired ViGEmBus. Its benchmark includes a Windows 1 ms receive timeout behaving as ~15.6 ms and stick **double-deadzone** causing unresponsive travel; both are lessons, not measured WinDock defects. License obligations and app stack divergence. | App GPL-3.0-or-later; `protocol/` separately Apache-2.0 ([protocol license](https://github.com/MNBLabs/phonepad/blob/main/protocol/LICENSE)). Reference concepts; only import Apache-covered protocol portions after attribution/license review, not main app code. | Highest value for packet-state contract, anti-replay, session watchdog, trace/benchmark harness, test negative cases and avoiding doubly-applied deadzones. **Do not adopt ViGEm as chosen driver merely because the example uses it.** |
| [PadConnect Android](https://github.com/PadConnectApp/PadConnect) + [PadConnectReceiver](https://github.com/PadConnectApp/PadConnectReceiver) | **Kotlin/Jetpack Compose**, Android virtual buttons/axes, UDP, Windows ViGEm/Linux uinput; Android vs PC split mirrors WinDock's companion/host. Its roadmap describes configurable layout and touch alternatives. | Its [security policy](https://github.com/PadConnectApp/PadConnect/blob/master/SECURITY.md) explicitly says **UDP lacks built-in authentication/encryption**. Some items such as DS4/custom grid editor/USB are planned, not verified shipped. Uses retired ViGEmBus, and receiver's exact runtime should be confirmed from code rather than relying on README wording. | Both repos GPL-3.0-only, so **no direct copying** into MIT WinDock without formal license decision. | Examine gesture/UI patterns, Android session ownership, visibility/config concepts and failure checklist; independently implement in Kotlin. |
| [NandyAziz/Custom-Controller](https://github.com/NandyAziz/Custom-Controller) | **Native Kotlin View**, USB tether/RNDIS first, **13-byte UDP snapshots** and claimed 250 Hz state-change + heartbeat, PS-style screen labels feeding **virtual Xbox**; control repositioning. | [SECURITY.md](https://github.com/NandyAziz/Custom-Controller/blob/main/SECURITY.md) says UDP is **unauthenticated/unencrypted**, so unsuitable unchanged for hostile/shared LAN. [Roadmap](https://github.com/NandyAziz/Custom-Controller/blob/main/docs/roadmap.md) lists Windows watchdog as **optional/future**. ViGEm retired. | Original app MIT; third-party ViGEm components need separate licensing. Could adapt bounded UI/gesture ideas with attribution after checking exact source files; independent implementation preferred. | Especially relevant to WinDock's **existing USB tether path** and native Android `MotionEvent`. Copy neither its missing auth nor a missing neutral watchdog. |
| [KaifCoding/virtual-gamepad](https://github.com/KaifCoding/virtual-gamepad) | Flutter Android + **C# Windows** host + ViGEmBus; [PROTOCOL.md](https://github.com/KaifCoding/virtual-gamepad/blob/main/PROTOCOL.md) defines an **18-byte input packet**, buttons/axes/triggers/sequence, auto-discovery and 60 Hz state loop, multiple client slots. | Protocol describes **HELLO by IP:port and no authenticated pairing/MAC**, so do not adopt it unreviewed; 3s client timeout is **too long as a stuck-button safety threshold**, even if removal happens eventually. Flutter is not the existing Kotlin app. Driver retired. | App MIT; audit dependencies/installer scripts/driver separately. | Packet-field map and capability/host discovery UX; *reject* timeout/security design as-is. |
| [TinkerNorth/dish-android](https://github.com/TinkerNorth/dish-android) + [satellite host](https://github.com/TinkerNorth/satellite) | Kotlin UI + JNI hot path, HTTPS pairing, **ChaCha20-Poly1305 UDP**, bounded buffering/input ownership, reconnect state machine and capability contract; detailed [architecture](https://github.com/TinkerNorth/dish-android/blob/main/docs/architecture.md) and [contract](https://github.com/TinkerNorth/dish-android/blob/main/docs/contract.md). | Far larger stack than needed; JNI and multiple physical controller mappings add complexity. Opt-out Firebase crash reporting/telemetry is incompatible with WinDock's **strict no cloud/telemetry** requirement. Different server/control-plane contract; must not drop into existing WinDock. | LGPL-3.0-or-later + other component licenses; review linker/distribution obligations and third parties. | Study state machine, controlled pairing, typed feature availability and authenticated sessions; implement lean Kotlin/C# equivalents (not wholesale Satellite/Dish merge). |
| [MokshKundra/Phone-Controller](https://github.com/MokshKundra/Phone-Controller) | **Node.js + WebSocket + ViGEm**, browser/Capacitor Android, optional `adb reverse` over USB. Direct evidence a Node/WebSocket route is a credible *baseline architecture*. | ADB debugging/reverse conflicts with WinDock's normal-user **USB tether without developer options**. JSON frames and WebView might cost more than a native optimized route; no trusted measured comparison found. Could not verify a repository LICENSE at the path checked, so don't reuse code. | License not verified; **architecture reference only**. | Justifies **benchmarking existing Node/WebSocket before building UDP**. Preserve our paired cookies/security, avoid ADB installation dependency. |

### Important distinctions

- **Xbox-compatible XInput ≠ native PlayStation DualSense.** PS-style button labels can feed an Xbox virtual pad; game/Steam/anti-cheat support varies.
- **All six reference apps don't prove our fork is functional.** All stated rates/latencies belong to authors, specific test hardware and specific measurement intervals; never claim WinDock achieved them.
- **A secure pairing UI is not the same as securing UDP packets.** Independent session authentication, replay protection and bounded frame validation are essential if UDP is introduced.
- **Wi-Fi vs USB tether:** a wired IP link can have better jitter, but not always; test actual phone/PC link. USB tether in WinDock is **ordinary IP**, not direct USB HID or ADB.
- **Licensing:** GPL code should not be copied into MIT WinDock without a deliberate license strategy. LGPL requires compliance even if integrated as a library. MIT/Apache components require notices; kernel drivers and redistributable installers must be evaluated separately.

## Specific lessons we should implement in WinDock

### WIN-1: Minimal controller model and clean interface boundaries (VS1)

Define a **platform-neutral ControllerState** before transport. Include axes (`LX,LY,RX,RY`), analog triggers (`LT,RT`), button bitmask (ABXY, D-pad, LB/RB, Menu/View, L3/R3), neutral state and revision. All hidden/unselected controls serialize as neutral. Kotlin UI derives snapshots; native PC backend consumes validated snapshots. Both must agree on endianness, range, signs and logical stick mapping.

### WIN-2: Safe realtime transmission — use baseline before extra protocol

Run one-stick+A native Android screen through a persistent, authenticated **WebSocket → Node → resident Windows helper → virtual controller** first, *after* driver proof. Timestamp in the Android app, at the host and at virtual submit. Do not couple sends to animations; immediately send button edges, coalesce superseded analog states, cap queue sizes. Benchmark comparable scenarios. Only then consider native **UDP**, full-state + repeat, sequence/epoch, HMAC/AEAD, anti-replay and late/loss watchdog. PhonePad and Dish are useful designs to compare; their security differs from WinDock's current LAN HTTP pairing.

### WIN-3: Authentication + fail neutral are release blockers

Avoid the bare-IP/port sender model in KaifCoding and unauthenticated UDP in Custom-Controller/PadConnect. For UDP, authenticate every packet and protect key negotiation; WinDock currently uses LAN HTTP and must not claim confidential provisioning until secure exchange is implemented. Always neutralize controls on `ACTION_CANCEL`, mode switch, paused/background, disconnect, lost packet freshness, Windows receiver crash/close and driver death. A watchdog around 120–250 ms is a **tuning candidate, not a verified safe fixed value**. A disconnect timeout of seconds is unsuitable as the *only* neutral safety measure.

### WIN-4: Touch ergonomics, calibration and accessibility

Evaluate fixed/floating virtual stick, adjustable radius, response curves and per-game deadzones. PhonePad documented **double-deadzone** effects: user's game may add a deadzone on top of ours. Provide actual transfer-function tracing. Multi-pointer ownership: two sticks + button + trigger should work simultaneously without a pointer suddenly changing controls. Ensure screen safe-area margins, thumb comfort on small phones, and no accidental Edit/Exit taps. Never enable gameplay inputs in layout editor. No haptics at all; gyro deferred until after stable gamepad release.

### WIN-5: Driver adapter contract and install lifecycle

Most phone-to-PC examples use **archived ViGEmBus**. A successful app using ViGEm does *not* settle WinDock's backend. Run [P2 driver feasibility](P2-DRIVER-FEASIBILITY.md), verify real **XInput** visibility, administrator/certificate installation behavior, Windows 10/11 support, rollback and licensing. Keep adapter swappable behind native Windows interface; do not let ViGEm-specific semantics leak into Android UI or packet protocol.

### WIN-6: Performance instrumentation and failure matrix

Copy the **benchmark *methodology***, not benchmark numbers: measured endpoint, actual hardware/version, p50/p95/p99, jitter and packet loss, battery/heat impact, driver-only XInput read-back, loss-of-link neutral latency, sustained presses vs ultra-short taps, cold reconnect, switch to Touchpad. PhonePad shows how a local timer assumption can slash effective rate (250 → 65 Hz); guard against timer-quantization on Windows. Live "latency" status must not mislabel RTT as one-way or touch-to-photon.

## Concrete integration decision matrix

| WinDock subsystem | Borrow design idea from | Implementation fit | Keep unchanged initially |
|---|---|---|---|
| `public/index.html`, `public/input-pad.js`, `public/style.css` | UI navigation and transparent previews (WinDock itself); ergonomic examples | Existing third Gamepad preview is already integrated. When Android native UI is ready, trigger it via trusted same-mode bridge and retain one-tap Touchpad return | Signature drawing and authenticated Touchpad WebSocket |
| Android `MainActivity.kt` + new Kotlin View/Activity | Custom-Controller native View; PadConnect pointer ownership; PhonePad layouts | **New native Kotlin Gamepad screen**, reusable controller state and local settings, no gameplay frames via WebView. Trust-check host/origin before launch | Current discovery, pairing, USB tether, keyboard bridge |
| Windows `src/platform/` + native helper/sidecar | PhonePad adapter concept; KaifCoding C# host | Separate Gamepad capability/provider interface and resident Windows worker; validate driver P2 first | Existing Node dock/mouse and Linux provider contract |
| `server.js`, `src/auth.js` | Dish state machine, PhonePad secure pairing | Authorized session negotiation, version compatibility, one owner, explicit unavailable state | Existing PIN pairing API and all other routes |
| `src/input-hub.js` or new `gamepad-hub.js` | Node/WebSocket reference Phone-Controller | Baseline dedicated socket with validated ControllerState, bounded queue, same-origin/session checks, independent release/watchdog | Mouse touchpad input route |
| Future fast UDP worker | PhonePad full-state/replay; Dish AEAD input | **Optional**, contingent on measurements; versioned compact state and secure session keys from protected handshake | Default WebSocket path until improved |
| Test suite / `docs/gamepad/` | PhonePad benchmarks, Dish state-machine tests | Driver/XInput probe, layout/profile unit tests, hostile/reordered packets, simulator + phone/PC timing | Existing WinDock regression gates |

## Red flags to keep visible in every review

1. **RED:** Driver exposes only generic HID but games require XInput, or needs dangerous signature bypass.
2. **RED:** Unauthenticated UDP endpoint or public firewall rule that accepts control packets from strangers.
3. **RED:** Release/neutral relies on a seconds-long session timeout or cooperative exit only.
4. **RED:** UI/video appears fast but no XInput data-plane measurement on *physical phone and PC*.
5. **RED:** Claims <1 ms end-to-end while measuring only one local stage or RTT incorrectly.
6. **RED:** GPL source pasted into WinDock MIT fork or proprietary driver bundled without rights.
7. **AMBER:** 250 Hz busy-loop drains phone battery and heats device; benchmark adaptive pacing.
8. **AMBER:** Duplicated Android session state between native Activity and WebView breaks Touchpad return.
9. **AMBER:** Game-level deadzone compounds app deadzone; calibration feels unresponsive.
10. **AMBER:** Host discovery fails on isolated guest networks, firewall or USB tether change; manual IP fallback/diagnostics needed.
11. **AMBER:** Stream and receiver advertise different packet versions but silently accept malformed frames.
12. **AMBER:** Multiple virtual controller slots confuse player order; v1 should start one phone/one controller.

## Research next actions and acceptance

- [x] Locate comparative public source projects and verify the stated licenses/protocol/security passages above.
- [x] Identify a shortlist and source-file integration map; update handoff/progress.
- [ ] Reproduce at least one reference project's end-to-end controller performance on test hardware (optional, no dependency on its stack).
- [ ] Complete [P2 driver/XInput proof](P2-DRIVER-FEASIBILITY.md).
- [ ] Complete VS1: one native stick+A input on actual Android → recognized Windows virtual Xbox controller, safe neutral and reconnect.
- [ ] Add full optional controls/editor and profiles.
- [ ] Measure WebSocket baseline; prototype authenticated UDP only if data support it.
- [ ] Validate no GPL/LGPL code was copied without license review.

**No external source code was incorporated in this documentation-only research.** Keep the final implementation original and respect project and third-party licenses.

## Sources (public repositories and documents inspected 2026-10-23)

- PhonePad: [README](https://github.com/MNBLabs/phonepad), [Security](https://github.com/MNBLabs/phonepad/blob/main/SECURITY.md), [Benchmarks](https://github.com/MNBLabs/phonepad/blob/main/docs/benchmarks.md), [Apache protocol license](https://github.com/MNBLabs/phonepad/blob/main/protocol/LICENSE).
- PadConnect: [Android](https://github.com/PadConnectApp/PadConnect), [Receiver](https://github.com/PadConnectApp/PadConnectReceiver), [Security](https://github.com/PadConnectApp/PadConnect/blob/master/SECURITY.md).
- Custom-Controller: [README](https://github.com/NandyAziz/Custom-Controller), [Security](https://github.com/NandyAziz/Custom-Controller/blob/main/SECURITY.md), [Roadmap](https://github.com/NandyAziz/Custom-Controller/blob/main/docs/roadmap.md).
- KaifCoding: [README](https://github.com/KaifCoding/virtual-gamepad), [Wire protocol](https://github.com/KaifCoding/virtual-gamepad/blob/main/PROTOCOL.md).
- Dish: [README](https://github.com/TinkerNorth/dish-android), [Architecture](https://github.com/TinkerNorth/dish-android/blob/main/docs/architecture.md), [Contract](https://github.com/TinkerNorth/dish-android/blob/main/docs/contract.md).
- Phone-Controller: [README](https://github.com/MokshKundra/Phone-Controller).
