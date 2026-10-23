> **ARCHIVED / SUPERSEDED.** This earlier handoff contains proposals (including haptics) that the user rejected. Use `../REQUIREMENTS-v2.md` and `../00-START-HERE.md` as current requirements.

# WinDock Universal Gamepad Mode — implementation handoff

**Project**: `https://github.com/aliihsaad/WinDock`
**Purpose**: Make an Android phone running WinDock behave as a low-latency virtual Xbox-style game controller for Windows PC games, with swappable visual layouts and a future Linux backend.
**Status**: Implementation specification only. This document does **not** claim the changes have been coded, built, installed, or tested.
**Approach**: Local-first; no remote cloud relay, accounts, third-party tracking, or command execution from untrusted packets. Respect WinDock's existing MIT license and preserve copyright notices.
**Baseline inspected**: `main` on 2026-10-23. Recheck upstream before editing.

## 1. Product outcome

- New **Gamepad** entry in the WinDock navigation/drawer.
- Tapping **Gamepad** opens an immersive landscape on-screen controller with **two independently operated analog thumbsticks**, D-pad, A/B/X/Y face buttons, LB/RB bumpers, analog LT/RT triggers (touch sliders; also optional simple digital tap), L3/R3 stick clicks, View, Menu and Xbox/Guide if the selected backend supports it.
- Switch between **Xbox** and **PlayStation-themed** visual labels. Both themes initially send the same *Xbox 360 XInput* button/axis schema. Do **not** imply the PC recognizes a DualSense merely because the screen shows PlayStation glyphs.
- On a Windows host, publish a genuine virtual controller visible to common XInput-capable games. No keyboard-to-WASD fake-controller workaround for the primary mode.
- Work over WinDock's pre-existing paired LAN Wi-Fi or Android USB tethering connection.
- Remap/reposition/resize buttons and adjust analog deadzones. First cut can ship one well-tested default landscape layout and one alternate visual scheme.
- Later add an explicitly selectable **Keyboard/Mouse Mode** for PC games that do not support controllers: map a virtual stick to WASD and the other to relative mouse aiming, with user-editable mappings. Implement with a tightly allowlisted native input path; do not suggest it will work around anti-cheat or application privilege restrictions.
- No stuck input on loss of Wi-Fi, loss of USB, session timeout, phone orientation change, backgrounding, navigation, host restart, or backend crash.

### Explicit non-goals for v1

- Streaming PC video to the phone. The user sees the actual game on the PC monitor. WinDock is the controller only.
- Guaranteed compatibility with **all** PC games, anti-cheat systems, privileged games, or titles with unusual input requirements.
- Real adaptive triggers, DualSense motion report, controller microphone, headset jack, PlayStation console pairing, or automatic multi-controller split-screen.
- Claiming to be universal for literally every game. Offer a later keyboard/mouse fallback for games without controller input.
- Remotely installing any OS driver without a clear explicit confirmation step.

## 2. Existing repository extension points (verified)

| Existing file | Current role | Integration change |
|---|---|---|
| `server.js` | HTTP server, session auth, WebSocket hub setup, lifecycle | New capability endpoint and `createGamepadHub`, clean shutdown |
| `src/auth.js`, `src/sync.js` | PIN/session authentication and WebSocket origin restrictions | Reuse, do not weaken or bypass |
| `src/input-hub.js` | Paired WebSocket `/input`, single owner, helper lifecycle, timeout, rate limit | Model separate `/gamepad` owner/lease on same security pattern; do not multiplex new messages into touchpad inadvertently |
| `src/input.js` | Tight validation of pointer/keyboard wire messages | Add a distinct `src/gamepad/protocol.js` validator |
| `src/platform/input.js` | Spawns native helper, bounded newline JSON protocol and shutdown | Reuse isolated subprocess approach for gamepad worker (`gamepad` fixed argv command) |
| `src/platform/windows.js` | Windows provider; injects `createWindowsInput` and uses native WinDockHelper | Add `gamepad` provider capability, backed by C# helper |
| `src/platform/linux.js`, `native/linux/src/uinput.rs` | Linux provider, uinput pointer/keyboard | Phase 2: dedicated uinput virtual gamepad with absolute axes/buttons |
| `native/win/Program.cs`, `native/win/WinDockHelper.csproj` | Native Windows helper (.NET 8) with `touchpad` command | Add `gamepad` verb and pluggable Xbox virtual device adapter |
| `public/index.html` | Main dock and modal dialogs, navigation drawer | Add Gamepad entry and full-screen gamepad dialog |
| `public/app.js` | Main UI event wiring and authenticated API handling | Wire `createGamepad()` and session cleanup |
| `public/input-pad.js`, `public/touchpad-gestures.js` | Existing pointer/gesture WebSocket UI | Reuse pointer-event design ideas, **not** mouse protocol semantics |
| `public/style.css` | Fullscreen landscape controls and touch interaction | Introduce responsive gamepad theme and safe-area layout |
| `public/sw.js` | Offline assets | Include new static scripts/styles in its cache list when necessary |
| `scripts/verify-input.mjs`, `test/run.mjs` | Existing validation and WebSocket integration test pattern | Add independent gamepad tests and link into suite |
| `scripts/build-windows.ps1`, `scripts/build-android.ps1` | Packaging | Carry native dependency; verify debug/production builds |

The Android `MainActivity.kt` is a WebView shell displaying the PC-served UI. **A WebView-based v1 is practical** and doesn't require rewriting the app in Kotlin/Compose. Native Android APIs may later provide vibration and gyroscope reports through a deliberately narrow, origin-restricted JS bridge.

## 3. End-to-end data path

```text
Android phone touchscreen (multitouch / Pointer Events)
   -> public/gamepad.js + gamepad input model
   -> paired WebSocket ws://HOST:8620/gamepad  (existing auth + origin check)
   -> src/gamepad/hub.js  (validate, rate-limit, dedupe, exclusive owner)
   -> gamepad-capable provider with owned, short-lived native helper process
   -> C# helper gamepad verb + driver adapter
   -> virtual Xbox 360 device / XInput
   -> Windows game reads virtual controller
```

Maintain **one active owner per virtual controller** for v1. A phone using the touchpad concurrently should not accidentally acquire the gamepad lease; both paths require their own cleanup. Ownership should be released after native device cleanup. Keep authorization checks and network bind behavior consistent with existing WinDock.

## 4. Wire contract proposal v1

Use full state snapshots rather than separate 'press button' and 'release button' network commands. That lets a lost packet be corrected by the next snapshot and makes neutral-state resets straightforward.

```json
{
  "type": "state",
  "seq": 172,
  "lx": 0.28, "ly": -0.65,
  "rx": 0.0,  "ry": 0.0,
  "lt": 0.0,  "rt": 0.85,
  "buttons": ["a", "rb", "dpad-up"]
}
```

Wire coordinates: `x` increases right; `y` increases **down the screen**. Convert to the virtual driver axis convention at the host; do not invert inconsistently across platforms. Backend analog values are initially normalized: both sticks `[-1.0, +1.0]`; triggers `[0.0, 1.0]`. Digital button names are fixed allowlisted enum: `a,b,x,y,lb,rb,l3,r3,back,start,guide,dpad-up,dpad-down,dpad-left,dpad-right`. Use `back`/`start` internally if mapping to XInput View/Menu.

Protocol checks (all mandatory):

- Object with **exactly** `type, seq, lx, ly, rx, ry, lt, rt, buttons` keys; no extras.
- `seq`: unsigned safe integer with monotonically increasing value within a session. Define reconnect resets.
- Axis values: real finite numbers in allowed ranges, never NaN/Infinity; no JSON coercion.
- `buttons`: array of unique strings, each in allowlist; length <= allowlist length.
- No freeform PC commands, keyboard shortcuts, process names, filenames or executable paths.
- Max payload e.g. 1024 bytes; WebSocket binary disabled in v1; per-frame server rate cap and client throttling (target 60 frames/s; tolerate refresh rates / jitter up to e.g. 120 received frames/s, burst bounded).
- Include `ping` heartbeat or repeat neutral full state when no input changed. A watchdog releases/zeros all gamepad state after e.g. **300–500 ms** without a valid fresh frame, followed by device cleanup if disconnected.
- The **server** rejects stale/out-of-order sequence numbers, failed auth, wrong Origin, second concurrent owners, invalid frames and unavailable driver. Report clear client-visible errors.

Normalize thumbstick radius, apply deadzone + response curve locally for responsiveness, and sanitize values again at the server. For a circular deadzone of `d`: if magnitude <= d output zero; else rescale `(magnitude - d)/(1-d)` and preserve direction. Clamp radius to 1. Touch must not cause page scroll, text selection or browser gesture navigation (`touch-action:none`, `preventDefault` where relevant, pointer capture).

## 5. Native Windows controller backend

### MVP choice

Implement an **Xbox 360 (XInput)** device on Windows using a **separately installed** ViGEmBus-compatible driver and `Nefarius.ViGEm.Client` in the C# helper. The ViGEm project and its official .NET client are MIT but **retired** and no longer maintained; this is an MVP compatibility tradeoff, **not** a long-term driver guarantee. Pin and review dependency versions. Use only authentic source/distribution, do not redistribute a driver without checking its license and packaging.

Known implementation concepts verified from the archived official client:

```csharp
using Nefarius.ViGEm.Client;
using Nefarius.ViGEm.Client.Targets.Xbox360;

using var client = new ViGEmClient();
using var gamepad = client.CreateXbox360Controller();
gamepad.Connect();
// For each validated state update, set axes, sliders and buttons,
// then submit the report (prefer a batched update to avoid intermediate states).
// Exact button/axis symbols should be read from the NuGet API before coding.
```

The native helper should:

1. Accept only the fixed argv verb `gamepad`, opening a bounded line-oriented JSON stream on stdin.
2. Create one virtual controller when the worker starts. Only declare `ready` *after* the driver successfully creates the device.
3. Convert normalized left/right stick states to signed 16-bit axis reports; triggers to unsigned 8-bit values; buttons to the supported button bitmask. Take special care at both extrema and stick Y direction.
4. Receive 30–60 Hz state reports without spawning per-frame processes. Keep one long-running helper process.
5. Emit safe diagnostics (`ready`, `error`, optional driver capability/version), but **never** echo raw gameplay data to the server log.
6. Reset all buttons, analog sticks, and triggers when stale or asked to stop; disconnect/dispose the virtual controller when session or process ends.
7. Detect missing/unsupported driver and communicate a descriptive remediation message instead of crashing the host.
8. Make all native code unprivileged except the separate opt-in driver installation. No silent Administrator elevation.
9. Gate driver-specific code behind an interface, e.g. `IVirtualGamepadBackend`, so Linux and/or a future actively maintained Windows adapter can be swapped without rewriting UI or networking.

**Alternative / future**: LizardByte `libvirtualhid` currently advertises actively developed, broad controller profiles (Xbox/PS/Switch), but its Windows driver-backed gamepads require **a machine license**. The library is MIT; the Windows driver/broker are not simply interchangeable with MIT-licensed components and have separate terms. Keep it optional; don't impose a proprietary paid dependency on WinDock's basic mode.

Do not promise that newer virtual HID *Xbox-styled* devices automatically occupy a Windows XInput slot. Explicitly test games that demand XInput. For the universal default, virtual Xbox 360 is the compatibility-first target.

## 6. Linux backend (Phase 2)

Use `native/linux/src/uinput.rs` patterns to create **a separate gamepad uinput device** with event codes for `BTN_SOUTH`, `BTN_EAST`, `BTN_NORTH`, `BTN_WEST`, bumpers, stick clicks, D-pad, `ABS_X`, `ABS_Y`, `ABS_RX`, `ABS_RY`, `ABS_Z`, `ABS_RZ` and `EV_SYN`. Configure axis minimums, maximums and flat/fuzz values. The gamepad should be visible to SDL and Linux games; avoid leaking joystick updates to pointer/keyboard helpers. On unsupported distros/compositors, show a clean capability error.

## 7. Touchscreen UX and inputs

**Default landscape layout:**

```text
┌────────────────────────────────────────────────────────────┐
│    [LB] [LT]     WIN DOCK  GAMEPAD     [RT] [RB]          │
│                                                            │
│     LEFT STICK                              [Y / △]         │
│         ◉                           [X / □]   [B / ○]       │
│                                      [A / ✕]              │
│     D-PAD                 View/Menu               ◉ RIGHT  │
│      ✚                                          STICK       │
│                                                            │
│  Back   [Edit layout] [Profile] [Connection]               │
└────────────────────────────────────────────────────────────┘
```

- Both analog sticks must respond **simultaneously** using independent `pointerId` ownership. Do not rely on a single-touch `touchstart` implementation.
- Thumbstick positions clamp to a visible thumb base with normalized x/y; releasing pointer or receiving `pointercancel` instantly recenters; L3 and R3 are independent tap buttons.
- Button presses use pointerdown and pointerup; allow pressing several buttons while moving sticks. Avoid click handlers that only fire on release.
- Triggers may begin as analog touch sliders; tap variant sends 0/1. Explain this difference in UI.
- Preference defaults: 0.12 stick deadzone, editable 0.00–0.30; 1.0 sensitivity; theme Xbox or PlayStation; store preferences **on the phone only** as WinDock's layout preferences already do.
- Device feedback: show `Connected`, `Driver missing`, `Controller in use`, `Reconnecting` and `Gamepad stopped` plainly. Provide a persistent **Stop** button to zero/disconnect on command.
- Preserve existing dark/glass WinDock visual language. Controls should be physically usable on 6–7 inch phones; size targets and safe-area insets matter more than ornamental glass.
- Keep the screen on while actively playing, or use the existing idle display controller carefully; ensure dim/rest does not interrupt an active gaming session unexpectedly. Pause/release on backgrounding and connectivity interruption.
- Provide configurable layout for racing (large analog steering and brake/throttle) and shooter (two thumbsticks, face buttons and triggers) after MVP.

## 8. API / capability reporting

Add `GET /api/gamepad` (authenticated):

```json
{
  "available": true,
  "connected": false,
  "driver": "vigem",
  "profiles": ["xbox360"],
  "reason": null
}
```

For Windows with driver missing: `available:false, reason:"Install a compatible virtual gamepad driver on the PC"` (never fake availability). For Linux before implementation: `available:false, reason:"Not yet supported on this host"`. Probe safely; avoid creating a controller solely from a status endpoint. `POST /api/gamepad/stop` is optional if stop/close can reliably handle it through the authenticated owner socket; don't make an unauthenticated shutdown path.

## 9. Secure transport and fail-safe behavior

- Reuse PIN pairing, session cookies, CSRF/Origin restrictions, and the trusted-LAN limitation already established in `server.js` and `src/input-hub.js`.
- Keep a separate WebSocket endpoint `/gamepad` rather than forwarding pointer input over `/input` and expanding its attacker-controlled message vocabulary.
- One owner per controller (or per slot, later). The gamepad owner must be bounded to its specific authenticated WebSocket lifetime.
- Do not permit unpaired clients, cross-site WebSocket requests, or the browser demo to instantiate a real controller.
- At most 60 state submissions/s from UI, allow bounded transient bursts on server, refuse oversized/invalid or binary payloads, honor bounded native stdin queue.
- **Fail closed**: no stuck throttle, steering, movement or shooting when phone locks, socket closes, driver fails, helper exits, host quits, or connection times out. Test each explicitly.
- If adding optional rumble, vet and bound all outbound messages; when unsupported, hide haptic option rather than claiming real vibration.
- Do not provide advice to bypass anti-cheat or protected app restrictions. Note that individual games may reject virtual pads and that this project does not defeat those restrictions.

## 10. Implementation sequence

### Milestone A — Core protocol and security

1. Add `src/gamepad/protocol.js`, pure validator and normalized-state helper; write tests for accepted and rejected packets.
2. Add `src/gamepad/hub.js` with injected backend, authenticated `/gamepad` WebSocket route, lease, heartbeat/watchdog and explicit shutdown.
3. Integrate into `server.js` via `createApp` and API status; preserve older provider tests and existing `/input`.
4. Add a null/mock backend for deterministic tests; don't use a real Windows driver in CI.

### Milestone B — Actual PC gamepad

5. Add `src/platform/gamepad.js` helper process contract and Windows backend factory.
6. Add `native/win/Gamepad.cs` and wire `gamepad` in `native/win/Program.cs`; separate driver handling behind interface and fail gracefully if not installed.
7. Update the C# project dependencies and Windows packaging; verify all required native DLLs accompany the built helper.
8. Add a test/diagnostic sequence to run Windows `joy.cpl` and verify sticks/triggers/buttons manually and by automated mock adapter tests.

### Milestone C — Phone UI

9. Add `public/gamepad.js` for multitouch stick/button model, 30–60Hz snapshots, client-side watchdog, profiles and teardown.
10. Add `public/gamepad.css` (or preserve conventions by extending `public/style.css`) and a fullscreen dialog/entry in `public/index.html`; wire `public/app.js`.
11. Add the new asset(s) to the offline precache manifest if necessary. Test in Android 7+ WebView and Chrome mobile, across phone sizes and refresh rates.

### Milestone D — Quality and expansion

12. Add analog trigger sliders, remap/resize, deadzones, sensitivity, split layout presets.
13. Add Android vibration feedback via a restricted bridge and then optional gyro controls.
14. Add Linux uinput virtual gamepad implementation.
15. Evaluate alternative virtual-controller backend(s), DS4/PS HID, rumble, multiple controllers, optional connected physical gamepad passthrough.
16. Add a **separate optional keyboard/mouse profile** for non-controller games. Unlike true gamepad mode, this uses a fixed validated set of game keys (W/A/S/D, Space, Shift, Control, Escape, etc.) and relative mouse movement. Build explicit focus/held-key release safeguards and do not merge it with the existing protected text-entry protocol without checking its invariants.

## 11. Acceptance tests (must pass before declaring done)

1. Windows Game Controllers control panel (`joy.cpl`) detects **one** Xbox 360 virtual controller only while a gamepad session is running (or as documented in app's lifecycle).
2. Simultaneously move left stick, move right stick, hold right trigger, press A and RB. All five independently register.
3. Every face/D-pad/shoulder/start/back/stick button maps to correct virtual input; no axis inversion.
4. Circular travel reaches full positive and negative axis limits, centers correctly, and respects the deadzone.
5. Wi-Fi and USB tethering work on normal paired devices. No cloud required.
6. Kill phone Wi-Fi while RT/A are held: within watchdog window, all analog and digital values release. No stuck throttle/gunfire.
7. Repeat cleanup tests for app backgrounding, orientation change, close dialog, host stop, native helper crash, network timeout, revocation, session expiration.
8. Unpaired connection, wrong origin, invalid frame, duplicate owner, excessive rate, and oversized frames are blocked.
9. Missing driver shows install guidance and leaves normal WinDock unaffected.
10. Existing `/input` touchpad and signature, launch, media, capture, and paired dock continue to work unchanged.
11. Windows native packaging tests, Android APK build, `npm test`, and Linux CI suites do not regress.
12. In at least one real XInput game and one gamepad tester, the virtual pad can steer, aim, and fire. Record test game and OS versions.

## 12. Practical rollout and risk notes

- MVP target: **Windows PC + Android phone**, local Wi-Fi and USB, virtual Xbox 360 gamepad. This is the best intersection of broad PC game compatibility and WinDock's current codebase.
- Linux Hyprland gamepad support is feasible via uinput but should follow a stable Windows proof of concept. iPhone UI could potentially reuse the WebView code when that companion is ready, but advanced native haptics/motion require separate work.
- The official ViGEmBus project is retired. Make driver use opt-in, do not embed an unknown third-party installer, pin checked sources, disclose lifecycle tradeoffs, and keep backend swappable.
- LizardByte libvirtualhid is actively developing broad emulation, but Windows virtual driver access is licensed; do not misrepresent it as a fully free/open-source option.
- Controller input support is not game streaming, and does not imply full anti-cheat compatibility or full controller-feature parity with Xbox Series / DualSense physical hardware.

## 13. Ready-to-paste Codex / Astra execution prompt

> You are implementing Universal Gamepad Mode in the existing `aliihsaad/WinDock` repository. Follow this specification. FIRST inspect current upstream files, tests and branches; no assumptions based solely on this document. Work on a new feature branch, never overwrite unrelated work. Preserve native host/WebView architecture, existing paired Wi-Fi/USB operation, local-only security, and compatibility of existing touchpad/signature features. Implement in the Milestone A–C order above. Use an Xbox 360 XInput virtual controller on Windows through an isolated, swappable native backend; clearly report missing/retired dependencies and do not silently install drivers. Implement robust independently tracked multi-touch analog sticks, controller buttons, triggers, frame snapshots, rate limits, origin/session authentication and watchdog cleanup so held inputs release immediately on disconnect. Add mockable unit/integration tests, update build/package scripts and docs, and run available tests/builds. If native Windows runtime/driver is unavailable in your environment, explicitly state that device integration is unverified—do not claim controller functionality based on mocks only. Produce a per-file summary of changes, commands executed, test results, any blocked prerequisites, and precise steps to verify on a Windows PC using `joy.cpl` and a compatible game. Work without cloud services.

## 14. References

- WinDock repository: https://github.com/aliihsaad/WinDock
- WinDock README: https://github.com/aliihsaad/WinDock/blob/main/README.md
- Official ViGEm retirement: https://docs.nefarius.at/projects/ViGEm/End-of-Life/
- Archived official .NET client: https://github.com/nefarius/ViGEm.NET
- .NET package: https://www.nuget.org/packages/Nefarius.ViGEm.Client/
- Modern alternative: https://github.com/LizardByte/libvirtualhid
- Driver/platform support and licensing: https://github.com/LizardByte/libvirtualhid/blob/master/docs/platform-support.md