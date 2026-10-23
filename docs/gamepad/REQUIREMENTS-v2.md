# WinDock — Modular Low-Latency Gamepad Mode (Revised implementation handoff v2)

**Fork:** https://github.com/Farzansayeed/WinDock (branch `feature/universal-gamepad`)  
**Original upstream:** https://github.com/aliihsaad/WinDock  
**Prepared:** 23 October 2026  
**Status:** Technical implementation brief; this file describes planned gamepad functionality, not currently working functionality. See `00-START-HERE.md` for progress. Physical end-to-end timing has not been tested.  
**Intended recipient:** Codex / Astra / a Windows–Android development team.  
**Supersedes:** `WinDock_Universal_Gamepad_Implementation_Handoff.md` (the earlier plan included now-rejected haptics and overemphasized a WebSocket/Node gameplay path).

## 1. Confirmed requirements — non-negotiable

1. **Selectable controls, not one mandatory Xbox controller layout.** Support 0, 1, or 2 visible analog sticks (a 1-stick layout lets the user pick whether the visible stick controls the logical left or right stick). Independently toggle **D-pad**, **ABXY**, **LB/RB**, **LT/RT**, and **Menu/View**. Allow individual control toggles later; the group-level choices must exist from day one.
2. **Layout editor.** Drag and reposition on-screen controls, resize controls/groups, select analog-stick size, and optionally adjust opacity. Keep safe areas clear. Permit overlapping only with deliberate confirmation; touch hit areas must never ambiguously send two incompatible controls.
3. **Save and load local profiles.** At least **Full**, **Single Stick**, **Minimal**, and **Custom** presets. Store arbitrary custom user profiles locally on Android, with no cloud account. Allow logical left/right stick mapping independently of physical placement. Use neutral reports for hidden controls.
4. **Normal controls first:** correct analog sticks, D-pad, ABXY, LB/RB, analog or digital LT/RT, Menu/View, optional L3/R3 if sticks support presses. **No haptics, rumble, vibration, force feedback, or adaptive triggers.** Do not surface them in settings, code interfaces, tests, or milestones.
5. **No gyroscope in the initial release.** Only revisit *as an optional later experiment after the normal controller passes real-game compatibility and latency targets*. Do not add gyro placeholder controls or a hidden early implementation.
6. **Low latency is a primary requirement, not an afterthought.** Benchmark the existing WebSocket route against a **native Kotlin → native Windows receiver UDP** input data path. Prefer the native route for gameplay if measurements support it; retain compatibility fallback and diagnostics.
7. **Use the existing Android WinDock APK and PC host.** Add a native gamepad screen to the Android Kotlin companion, reachable from existing WinDock navigation. Do not ship an unrelated second Android app. Existing docking, touchpad, signature, capture, discovery, and pair-by-PIN features remain functional.
8. **Recognized virtual PC controller.** On Windows, start with virtual Xbox 360/XInput output for common PC games. PlayStation-style *screen labels* can be added without promising true DualSense emulation. Full PS controller device emulation is a separate capability/back-end decision.
9. **Local-only:** no internet relay, telemetry, accounts, or server-hosted controller state. Allow local Wi-Fi and existing Android USB tethering modes; no ADB debugging should be necessary.
10. **Input safety:** buttons and sticks must return to neutral on release, app background, navigation, link loss, timeout, driver failure, and exit. A frozen throttle/shoot button is a failed test.

## 2. Source code reality — verified repo integration points

WinDock's **Windows PC host is Node.js**, using WebSocket for existing mouse/touchpad input, a native **C#/.NET 8** Windows helper, and a platform abstraction. WinDock's Android companion is **Kotlin**, with a **WebView showing a dock page served by the PC**. Pairing/discovery is already implemented; USB tethering is also documented.

| Existing source file(s) | Confirmed job | Extension to build |
|---|---|---|
| `android/app/src/main/java/com/windock/app/MainActivity.kt` | Kotlin activity and trusted WebView shell with constrained JavaScript bridge | Add Gamepad bridge/action to open an **in-app native Kotlin gamepad screen** with no WebView per-frame input path |
| `android/app/src/main/java/com/windock/app/EndpointPolicy.kt`, `ServerUrl.kt`, `Discovery.kt`, `PhonePreferences.kt` | Host filtering, saved addresses, discovery, local preferences | Reuse PC identity, endpoint selection and Wi-Fi/USB connection; keep local profile storage separate |
| `public/index.html`, `public/app.js`, `public/style.css` | PC-served dock UI/navigation | Add **Gamepad** entry and capability checks; phone tap routes to Kotlin; optional browser fallback only if desired |
| `server.js`, `src/auth.js`, `src/sync.js` | PC HTTP, PIN session cookies, authorized WebSocket origin checks | Add a **control-plane** `/api/gamepad/...` session negotiation endpoint. No gameplay per-frame forwarding on preferred path |
| `src/input-hub.js`, `src/input.js` | Existing authenticated input WebSocket, rate limiting, session ownership | Reuse patterns for security/fallback; do **not** add unvalidated gamepad verbs to mouse protocol |
| `native/win/Program.cs`, `native/win/WinDockHelper.csproj`, `native/win/Touchpad.cs` | C# helper process and existing touchpad input | Add dedicated long-lived **GamepadReceiver** and virtual-controller adapter (may be independent process) |
| `src/platform/windows.js`, `src/platform/input.js` | Windows helper setup and platform provider | Add capability/status/driver availability and managed receiver lifecycle |
| `native/linux/src/uinput.rs` | Linux pointer/keyboard via uinput | **Later:** dedicated Linux gamepad uinput device; keep out of initial Android+Windows scope |
| `scripts/verify-input.mjs`, `test/run.mjs`, Android tests | Existing input and CI checks | Extend with gamepad math, protocol, loss, authentication, and Android multitouch tests |

Always re-check upstream HEAD before implementation.

## 3. Architecture: control plane vs high-performance data plane

### Control plane — Node.js is suitable here

```
Android existing WinDock app + current paired session
        |
        | discovery, connection status, capability negotiation,
        | layout availability, start/stop, short-lived input-session ticket
        v
WinDock Node host (current web server, port 8620)
        |
        | bounded local IPC start/stop/configuration, not every joystick frame
        v
Native PC gamepad receiver service
```

Keep authorization aligned with existing pairing. Use a narrowly scoped one-time session ticket to attach the gamepad to the PC service. Tickets expire quickly, are never logged, and belong to one paired handset / one active controller session. A native Android REST request may retrieve existing WebView session cookies through Android's native `CookieManager`, **not by exposing raw secrets to arbitrary page JavaScript**. The Gamepad bridge must validate the trusted active host and origin as carefully as the existing KeyboardBridge.

**Security nuance:** WinDock currently uses LAN HTTP. A token delivered over HTTP cannot be represented as confidential from a malicious observer on the local network; simply putting HMAC or encryption around later UDP frames does not fix intercepted key provisioning. Preserve the existing trusted-LAN scope initially and explicitly document it. For stronger LAN adversary protection, design authenticated key agreement/pinned local TLS/QR host-key confirmation before shipping a claim of transport confidentiality.

### Preferred gameplay data plane — bypass Node and WebView for hot input

```
Android OS MotionEvent (native, each pointer ID)
     -> Kotlin Custom View / Canvas + controller state model
     -> dedicated non-UI networking thread
     -> authenticated, sequenced compact UDP datagrams over Wi-Fi / USB-tether LAN
     -> resident native Windows C# UDP receiver (NOT Node)
     -> virtual-controller driver API (XInput-compatible device)
     -> PC game
```

The Kotlin screen uses **real OS touch events**, not a JavaScript `pointermove` listener inside a WebView. The native network transmitter must not wait for visual animation frames or the UI drawing loop. The Windows receiver and virtual-controller session stay resident while Gamepad Mode is active; no new process is launched for each state update.

**Fallback/prototype path:** existing paired, authenticated WebSocket → Node `ws` → persistent native helper. It is simpler and may be sufficiently fast on a healthy local network. **Do not claim Node inherently causes high latency.** Perform comparable end-to-end tests before choosing permanent defaults. On unreliable Wi-Fi, UDP avoids TCP's head-of-line blocking but can drop/reorder input; a correct full-state protocol and neutral watchdog are mandatory.

## 4. User-facing controller groups and optionality

| Toggle | Controls shown | Notes |
|---|---|---|
| Left analog | Left stick and optional L3 click | Independent center/deadzone/size; can be hidden |
| Right analog | Right stick and optional R3 click | Independent center/deadzone/size; can be hidden |
| D-pad | Up, down, left, right | Supports diagonal combinations if virtual driver reports them |
| ABXY | A, B, X, Y | Full multitouch and press-and-hold |
| LB/RB | Left bumper, right bumper | Continuous hold state |
| LT/RT | Left and right triggers | Prefer **0.0–1.0 analog** swipe sliders; optional digital tap behaves 0/1 |
| Menu/View | Menu/Start and View/Back | Independently relocatable; do not reserve OS navigation gestures |

**One-stick layouts:** user selects logical **left stick** OR **right stick**; place it wherever on screen they prefer. A single stick is not hardwired to PC movement. Optional stick clicks must use their corresponding logical L3/R3 bits.

**Design rules:** Every visible group is draggable/resizable in Edit Layout; keep minimum touch-target dimensions and device safe-area margins; permit restoring factory defaults; store profiles per handset. Hidden controls are forced to zero, never retain previous values from another profile. Normal screen includes **Gamepad**, **Edit Layout**, **Profiles**, and **Leave Gamepad** entry points. The editor must disable gameplay input to prevent accidental actions while rearranging.

**Starting presets:** `Full` (both sticks + all groups); `Single Stick` (1 stick + ABXY + user-selected triggers/dpad); `Racing` (steering stick + LT/RT + optional buttons); `Minimal` (user-selected essentials); `Custom` (free arrangement). All presets editable.

Do not add haptic controls, phone vibration, gyro selectors or adaptive-trigger emulation in v1.

## 5. Native Android touch handling

- Implement e.g. `GamepadActivity.kt` + `GamepadView.kt` or a contained custom Kotlin `View`. Reuse WinDock's existing app identity, connection/pairing state and build system.
- Process `ACTION_DOWN`, `ACTION_POINTER_DOWN`, `ACTION_MOVE`, `ACTION_POINTER_UP`, `ACTION_UP`, and `ACTION_CANCEL`. Track **stable pointer IDs**, not indexes, so multiple fingers independently move sticks/press buttons. Use `event.getPointerId(index)`.
- Do not turn pointer movement into an OS mouse action. Each touch is owned by its selected control until release/cancel, with explicit retarget rules.
- Calculate stick magnitude with circular clamping, adjustable deadzone, calibrated center, and a smooth response curve. Provide a user-adjustable Y-axis inversion flag per stick. Map triggers to 0.0–1.0, buttons to explicit boolean bitmask.
- Android may batch `ACTION_MOVE` history. Read `MotionEvent` timestamps and historical points for **latency diagnosis / smoothing calibration** when useful; submit latest coherent state without intentionally replaying stale samples as new controller states. Source: https://developer.android.com/reference/android/view/MotionEvent.
- Separate rendering from sending. Schedule immediate send on button edge and meaningful stick change; run a paced active-state refresh at **configurable 60/120 Hz** (test phone capability; avoid assuming 120 Hz is always available). Do not busy-spin the UI thread.
- Keep controller state in a narrowly shared immutable snapshot or well-synchronized state buffer. Transmit on a dedicated I/O thread with bounded queue and **drop superseded analog states** instead of letting old frames accumulate.
- A low-power idle keepalive may be slower than active input reporting, but it must meet PC watchdog requirements.
- While active: handle screen orientation/immersive mode safely, keep the display awake if appropriate, and immediately release on pause, app switch, touch cancel, background, disconnect, and screen transition. User can exit at all times.

### Sync / integration of Android app and PC host

- No separate app, account, database synchronization, or cloud relay.
- The **PC** owns actual virtual device creation and tells the phone its ability: `gamepadSupported`, `backend`, `controllerType`, `protocolVersion`, `inputTransport`, `udpPort`, and session ownership. The **phone** owns visual positions, active groups, and per-device saved profiles (Android DataStore/SharedPreferences).
- On connection: existing paired WinDock Android client asks PC for capabilities → requests one-time gamepad session → opens Kotlin GamepadActivity → native Android transmitter starts streaming to the negotiated PC LAN address/UDP port → C# reports neutral and disconnects on end.
- The desktop webpage can show a Gamepad entry, but **only the trusted WinDock Android shell** opens the native GamepadActivity. A browser/PWA should show a clear unsupported/fallback message instead of trying to call missing native methods.
- Build and release **both** updated Windows host and updated Android APK. Feature-detect protocol version; old Android + new PC and new Android + old PC must fail gracefully without breaking ordinary WinDock.
- A layout/profile update is local, instantaneous and does **not** require waiting for the PC. Only controller **state** streams continuously. Profiles may be exported/imported via local files in a later phase, not auto-synced through a remote service.
- For USB: use the already documented **Android USB tethering** mode (ordinary IP networking across the USB cable); no developer mode or ADB needed. Use actual discovered tether network interface and re-negotiate on transport changes.

## 6. Transport protocol details: compact full-state snapshots

### Datagram content (proposal, adjust after prototyping)

```
version:       uint8
packetType:    uint8 (state / heartbeat / end)
sessionId:     uint64 (short ID; not an authorization secret)
sequence:      uint32 or uint64, monotonically increasing per session
leftX/leftY:   int16 each
rightX/rightY: int16 each
leftTrigger:   uint8
rightTrigger:  uint8
buttons:       uint16/uint32 fixed bitmask
reserved:      bits for future protocol negotiation; reject unspecified bits
integrity tag: authenticated tag/MAC if session security material exists
```

Small datagrams (typically tens of bytes + authentication overhead) fit easily within ordinary MTU limits. Compactness reduces copies/parsing; it **does not** by itself guarantee lower latency. Use a fixed versioned schema, strict byte-length checks, legal axis ranges, and a bounded receive rate. A real implementation may also include a session nonce/epoch and authenticated encryption nonce.

**Why send full state?** Every frame describes all active buttons/axes. If a packet is lost, the next frame corrects the device; events don't depend on reliable delivery of an earlier `button-up`. To protect ultra-short taps, emit immediately on both down/up changes and optionally duplicate **recent state/edge** over the next scheduled reporting intervals, without resurrecting released controls. Always keep sequence numbers; reject stale/out-of-order packets.

**Data-plane session security:** authenticate each UDP frame to the session using an established key, enforce freshness/anti-replay sequence checks, bind/validate sender, allow one owner, set strict rate limits and reject malformed payloads. Do not treat a 4-digit pairing PIN as a safe direct encryption key. Use explicit local pairing/secure key agreement if defending against LAN sniffers. When using existing HTTP pairing, label its security limitations clearly.

**Watchdog:** when freshness stops, the PC sends a **neutral report promptly** (target initial threshold ~150–250 ms, to be tuned by testing) and eventually disposes the virtual controller/ownership. On explicit close, immediate neutral+release. Do not wait for the normal watchdog when user exits intentionally. Return to idle when any app loses focus or UI gets suspended.

**Unreliable vs reliable:** UDP is a strong candidate for live analog gamepad input because the newest state supersedes the old state. It is not automatically faster on every network. Retain a versioned WebSocket/TCP fallback, use TCP_NODELAY where applicable, compare realistic loss/jitter across Wi-Fi and tethered USB, and never claim specific timings without measurement.

## 7. Windows virtual controller output: backend is swappable

A touchpad or `SendInput` mouse event alone **does not** create a game controller. The native Windows receiver must submit state to a virtual gamepad/HID backend that the game can see as a controller. A normal PC app cannot simply claim to be a physical Xbox device without appropriate OS support.

**Candidate A: HIDMaestro** — https://github.com/hifihedgehog/HIDMaestro  
Recent MIT-licensed Windows virtual-controller project with C# API and Xbox 360 profiles. Its README **self-reports** local device-output latency around 35 microseconds; this is **NOT end-to-end phone-to-game latency**, and its installation requires a trusted local driver/certificate setup and administrative permissions. Treat as **evaluation candidate**, not automatically a proven security/compatibility winner. Check the project's latest artifacts/CI, driver-install trust implications, minimum Windows versions, XInput compatibility, and licensing before adoption.

**Candidate B: ViGEmBus / Nefarius.ViGEm.Client** — https://github.com/nefarius/ViGEmBus  
Widely known Xbox 360/XInput emulation approach; officially **retired and archived in 2023**, so use only with explicit support, security, and redistribution tradeoffs. Do not silently install outdated drivers or unsafe auto-updaters. https://docs.nefarius.at/projects/ViGEm/End-of-Life/

**Candidate C: LizardByte libvirtualhid** — https://github.com/LizardByte/libvirtualhid  
Cross-platform library with a Windows virtual HID backend, but the Windows driver-backed gamepad path **requires a machine license** and the driver/broker carry separate terms. Not a default for a free fully open-source implementation without a conscious licensing decision. https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md

Make the app detect the installed backend and present a clear setup/status screen when no compatible virtual controller can be created. Design `IGamepadOutput` (Create/SubmitState/Neutral/Close/Status) so protocols/UI don't depend directly on one driver. Prefer a single pre-validated Xbox 360 logical mapping; do not promise every anti-cheat-protected game will accept virtual controllers.

**Important:** research and benchmark HIDMaestro as a potentially more current free/open option. Do not blindly select it based on author-reported microbenchmarks. Run a clean Windows 10/11 test-machine install/security review and actual XInput/game tests before selecting a production driver.

## 8. Latency metrics: how to make the decision using real data

End-to-end input-to-game latency involves touch sampling, Android dispatch, app processing, transport, OS scheduling, virtual driver, game polling, game simulation, display refresh. Avoid publishing invented universal millisecond numbers. Device frame times add real delay; a PC game at 60 fps has a **16.7 ms frame period**, independent of how fast the packet arrives.

**Profile multiple checkpoints:**

1. Android event timestamp (`MotionEvent.getEventTimeNanos()` on supported APIs or uptime-based timestamp), Android app receive/process time, and socket queue entry. Use a monotonic clock.
2. Native PC receiver arrival, validation finish, virtual-device submit time, and if possible the time a test reader/XInput sample sees the state.
3. **Comparative end-to-end physical observation:** record a visible touch indicator and game/tester reaction with a high-frame-rate camera when possible (the phone and PC clocks aren't automatically synchronized). A PC loopback receiver can also return sequence IDs for round-trip analysis; RTT/2 is not a verified one-way latency measurement on asymmetric paths.
4. Report **p50, p95, p99, worst case, packet loss, jitter, over-run count and sustained rate** separately over 1 minute and 10 minute tests. Compare real connected phone over USB tether, Wi-Fi 5/6 GHz, and congested Wi-Fi. Run same phone/PC/game for fair A/B testing.

**Engineering starting targets (aspirational, not guarantees):**

- Native receiver path from **Android app receipt of touch event to PC virtual report submission**: aim **p95 < 10 ms on good USB tether**, **p95 < 20 ms on good local Wi-Fi**. Excludes time the touch hardware spent scanning/batching and excludes game's render/display latency. Revise after hardware measurements rather than marketing them as established performance.
- Button down/up changes sent **immediately**, not held until the next UI draw frame.
- No visible degradation after ten minutes (no growing input queue, stale sends, memory growth, thermal overload, or stuck input).
- No button remains held after a session teardown/disconnect; neutral watchdog must be reliable even when the UI process is killed.

**Optimization sequence:** 1) eliminate accidental batching/queue growth and WebView drawing dependencies; 2) compare USB tether vs Wi-Fi with a wired PC-to-router connection; 3) compare native UDP vs well-configured native TCP and Node WebSocket; 4) test priority and input event handling; 5) choose backend only after seeing real XInput tests. Avoid spinning a high-priority busy-loop that drains battery or makes Android UI unresponsive.

## 9. Delivery phases (do not skip phase gates)

### Phase A — Controller model and selectable layout (no actual virtual driver yet)

- Implement pure Kotlin gamepad state model and pointer ownership math; one-stick, two-stick, zero-stick, D-pad, ABXY, LB/RB, LT/RT, Menu/View; profile toggle/reposition/resize; save/load locally.
- Debug overlay shows normalized axes and pressed button bits. Test simultaneous fingers and release/cancel, screen rotation, changing layouts, and exact neutral state for hidden controls. No haptics/gyro code.
- Add entry to existing WebView navigation with secure native bridge; don't break original WinDock navigation. Build Android APK.

### Phase B — Native PC virtual controller and end-to-end proof

- Implement C# long-lived receiver and swappable output backend. Install/test selected driver by **explicit** user action. Drive `joy.cpl` / a known XInput tester with a native test fixture **before network integration**.
- Reuse pairing for control-plane session setup. Native Kotlin ↔ C# UDP uses authenticated, sequenced compact full-state protocol with anti-replay and timeout-neutral behavior. Keep Node out of hot input data path.
- Optional fallback Node/WebSocket prototype for A/B latency and diagnostics. Benchmark and document results.

### Phase C — Polish after real gaming tests

- Implement fine drag/resize, button-level optional toggles, adjustable deadzone/curves, per-game named profiles, USB/Wi-Fi reconnection improvements and accessibility. Verify Windows installer + Android APK packaging and upgrade/downgrade compatibility.
- Only once these work, discuss **optional gyro** as a **new separately gated phase**. Do not schedule haptics as future work unless the user changes scope.

## 10. Acceptance checklist

- [ ] Android WinDock companion adds Gamepad mode; existing dock, touchpad, capture and signature remain usable.
- [ ] One left stick, one right stick, two sticks and no sticks are valid configurations; hidden axes neutral.
- [ ] D-pad, ABXY, LB/RB, LT/RT and Menu/View toggles work individually as groups; optional finer remapping in editor.
- [ ] Each control moves/resizes without gameplay actions being sent during editing; custom profiles persist across reopen/restart.
- [ ] Two simultaneous moving sticks + LT + A + RB all reach PC as simultaneous input.
- [ ] Analog triggers register intermediate values, not just digital on/off.
- [ ] No haptic or gyro feature appears or runs in v1.
- [ ] USB tethering and trusted local Wi-Fi modes both work without requiring Android USB debugging.
- [ ] The native PC driver registers an Xbox-compatible controller; tested in `joy.cpl`, XInput tester, and at least two PC games.
- [ ] All buttons/axes neutral on normal release; all neutral promptly on app switch, lost signal, packet loss, driver failure, and exit.
- [ ] Replay/old packets cannot restore a released button; unauthenticated peers cannot take control.
- [ ] Real p50/p95/p99/jitter/packet loss benchmark logs exist, **including an actual Android device + actual Windows machine**. No unverified latency claims.
- [ ] `npm test`, Windows build/smoke tests, Android lint/unit/instrumented tests, and installer checks pass or failures are documented accurately.
- [ ] Both Android APK and PC host installations are version-compatible or expose clear actionable update guidance.

## 11. Copy/paste brief for Codex / Astra

> Fork the latest `aliihsaad/WinDock` into an authorized writable repository and implement **Modular Low-Latency Gamepad Mode** according to this entire v2 document. Preserve existing WinDock features, paired local-only operation, and MIT copyright notices. Implement a Gamepad Mode inside the **existing Kotlin Android companion**; user-selected visible control groups are left/right sticks (0/1/2, choose logical side for one), D-pad, ABXY, LB/RB, LT/RT, Menu/View; all can be arranged/resized and saved in local profiles. No haptics, rumble, vibration, gyro, adaptive triggers, or other motion input in v1. For best practical input latency, benchmark WebSocket/Node against native Kotlin touch-event handling plus a direct sequenced UDP data plane to a **persistent native Windows C# receiver**, which drives a swappable virtual Xbox/XInput device backend. Node remains the discovery/pairing/control plane, not the preferred per-input forwarding path. Handle authentication, integrity, anti-replay, packet loss, neutral on disconnect, Android Wi-Fi and existing USB tethering, session version compatibility, and security of existing WebView bridges. Evaluate HIDMaestro and retired ViGEmBus based on verified Windows compatibility/security, not unsupported speed claims, and never install a driver silently. Create automated tests and real-device benchmark instructions. Implement in phases A, B, C. Report every changed file, build/test results, hardware driver prerequisites, measured latency, and anything not actually verified. **Do not report a working gamepad if the Windows driver and physical Android input have not been tested.**

## 12. Sources / implementation references

- WinDock repository: https://github.com/aliihsaad/WinDock
- Android event batching and pointer APIs: https://developer.android.com/reference/android/view/MotionEvent
- HIDMaestro repository (claims require independent validation): https://github.com/hifihedgehog/HIDMaestro
- ViGEmBus official end-of-life notice: https://docs.nefarius.at/projects/ViGEm/End-of-Life/
- LizardByte libvirtualhid Windows license requirements: https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md
- Android USB tethering: https://support.google.com/android/answer/9059108?hl=en-IN

---

**Scope reminder:** Native Kotlin gamepad UI + configurable controls + low-latency authenticated local transport + Windows virtual controller first. No gyroscope until initial release is proven. No haptics at all.