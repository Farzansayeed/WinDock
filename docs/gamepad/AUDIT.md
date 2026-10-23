# WinDock Universal Gamepad — Critical Product + Engineering Plan Audit

**Audit date:** 2026-10-23  
**Repository:** [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock/tree/feature/universal-gamepad), branch `feature/universal-gamepad`  
**Audit status:** Research and static source/plan review; **not** an implemented feature, hands-on installation test, security penetration test, or real latency benchmark.  
**Scope:** [Live checklist](PROGRESS.md), [revised requirements](REQUIREMENTS-v2.md), [UX spec](01-UX-NAVIGATION.md), [existing UI screenshots](UI-REFERENCE.md), current Android Kotlin bridge, Node auth/input pipeline, Windows .NET 8 helper and CI.

## Executive decision

**Proceed, with a changed execution order.** The user-facing product is well scoped; the greatest feasibility risk is Windows virtual controller device creation/install/permissions, not designing the joystick. The plan also commits too early to a native UDP implementation without proving that the existing WebSocket data path misses a measurable target.

**Recommended next move:** run a **short Windows-driver feasibility spike (P2)** and a **thin Touch & sign navigation prototype (P1)** in parallel. Do **not** build a polished Android layout editor, install unvalidated virtual drivers, or promise universal game support/low latency before a small real-device end-to-end slice works.

### Non-negotiable user choices retained

- Gamepad is inside existing **Touch & sign**; one-tap **Touchpad ↔ Gamepad** without returning to the dashboard; Signature unchanged.
- Optional control groups: 0/1/2 analog sticks with selectable left/right role; D-pad, ABXY, LB/RB, LT/RT and Menu/View; movable, resizable, locally saved profiles.
- Android application remains **the existing Kotlin WinDock APK**; local Wi-Fi and existing USB tethering; no cloud.
- **No haptics, vibration, adaptive triggers or rumble UI; no gyro in initial release.**
- Windows games should see a *real virtual Xbox/XInput-compatible controller*, not only simulated WASD. Do not misrepresent PlayStation-style face-button skins as DualSense emulation.

## Ratings — qualitative planning judgment, not measurements

| Dimension | Score | Why |
|---|---:|---|
| Product definition | 8/10 | Clear scope and excellent customization intent; touch ergonomics and accessibility need criteria |
| UX/navigation feasibility | 7/10 | Existing tab/modal makes entry easy; native Activity ↔ WebView return and session restoration require care |
| Windows-device feasibility | 4/10 | No backend chosen or demonstrated; admin elevation, certificate trust, licensing and runtime conflicts |
| Performance plan | 6/10 | Sound native-input goals but transport selected ahead of benchmarks |
| Security/recovery | 5/10 | Correctly flags watchdog and pairing, but key establishment / machine-wide driver changes need proof |
| Testing/release readiness | 5/10 | Phase gates exist, but no test evidence, install protocol or hardware matrix yet |
| Tracking and handoff | 8/10 | Canonical tracker/worklog/screenshots exist; add mandatory audit gates and test evidence fields |

## Critical findings and precise remediation

| ID | Priority | Risk / gap | Required correction / acceptance gate |
|---|---|---|---|
| **A1** | **CRITICAL** | Virtual Xbox controller backend is unproven. A controller that appears as generic HID is **not guaranteed XInput-visible**. Driver signing, rights, .NET version, admin privilege and uninstall are unresolved. | P2 proof-of-concept **before** major UI/editor work. Measure Windows Game Controllers and an XInput-capable test; decide supported Windows versions and actual driver install story. |
| **A2** | **HIGH** | Driver choices are materially different; **“open-source” does not imply easy signed Windows deployment**. HIDMaestro current source uses .NET 10 and elevated device creation; WinDock helper targets .NET 8. A machine-trusted local self-signed certificate is a security/UX decision. libvirtualhid Windows driver needs a paid license. ViGEmBus is retired. | Compare isolated elevated installer/service, process architecture and redistribution. Reject any option requiring unsafe driver-signature bypass or unapproved root-certificate installation. Test rollback. |
| **A3** | **HIGH** | Existing plan builds P1 visual shell, P3 polished native controls and P4 receiver before proving **phone → PC → recognized controller**. Risk of attractive but unusable demo. | After driver spike, ship **vertical slice**: one stick, A button, real Android device, real Windows virtual controller, authorized input channel. Only then add groups/editor. |
| **A4** | **HIGH** | Assuming UDP beats Node/WebSocket is unverified and doubles protocol/security work. Per-stage p95 targets in past discussion were **aspirational**. | First benchmark persistent-helper authenticated WebSocket baseline with latest-state coalescing. Prototype UDP only after a measured bottleneck; compare p50/p95/p99 and jitter on same devices, USB and Wi-Fi. |
| **A5** | **HIGH** | Security: existing WinDock PIN/session rides LAN HTTP. A UDP HMAC **does not** prevent eavesdropping if provisioning secret can be sniffed. New native bridge adds an authorization surface. | Explicit threat model: trusted LAN vs hostile LAN. Bind native Gamepad session to approved paired PC, verify origin and capability, short-lived tickets, anti-replay and rate limits, avoid exposing secrets to JS. Consider authenticated key exchange/TLS before strong confidentiality claims. |
| **A6** | **HIGH** | Fast Gamepad ↔ Touchpad navigation crosses a native Android screen and PC-served WebView. Activity lifecycle, modal open state, pairing cookies, orientation, back gestures and old touchpad WebSocket could break seamless return. | Design **single return contract**: entry from input mode; neutralize outgoing gamepad and close its session; resume Touchpad within same modal; test phone Home/Back/screen lock/rotation and rapid switching. |
| **A7** | **HIGH** | No-haptics touchscreen controllers have no physical button edges. Joystick drift, thumb lift, collisions with bezel/Android gestures, buttons too close together and latency perception can make nominally functional controls frustrating. | Real-phone usability checks: multi-pointer ownership, floating/fixed-stick option, deadzones and recentering, triggers as analog sliders, diagonal D-pad, sensible reach, hit boxes, one/two-stick preset ergonomics; editor cannot emit gameplay input. |
| **A8** | **CRITICAL safety** | Stuck buttons or analog throttle after link loss, backgrounding, phone crash, PC receiver death or driver stop. UDP state loss and button taps shorter than send interval can be missed. | Layered neutralization: immediate release on local exit/cancel/profile switch + PC stale-state watchdog + virtual-device disposal. Test deliberate kill, network cut, app sleep, packet loss/reorder, mid-button disconnect. Preserve brief taps without replaying obsolete states. |
| **A9** | **MEDIUM** | Gamepad “universal” label overpromises. Some titles accept only particular APIs; anti-cheat can restrict virtual devices; Steam Input remapping and XInput slot order may create issues. | Define **supported PC games/controllers**, maintain tested game matrix; show honest “controller not available” rather than false green connected state. Avoid anti-cheat bypass features. |
| **A10** | **MEDIUM** | Performance metrics lack agreed instrumentation and target environment. Input-to-virtual-report ≠ actual touch-to-photon. 120 Hz may increase heat, battery and network traffic for little user-visible gain. | Instrument Android touch-event timestamp, packet transmit/receive, receiver submit and device read where possible; clock synchronization methodology for cross-device timestamps; record device specs, jitter, loss, battery and game display effects. Defaults based on measurements. |
| **A11** | **MEDIUM** | CI runs on PR/main, not automatically on push to this feature branch. C# driver integration and Kotlin instrumentation will need test harnesses beyond `npm test`. | Add isolated tests/harnesses; record commands/results, manually trigger workflow or self-PR within fork when useful; document physical tests separately. Never mark physical acceptance complete based only on CI. |
| **A12** | **LOW** | App updates could separate new Android from old host, and profiles may be lost across reinstalls. | Version capability handshake with graceful disable; local profile schema version/migration and export later, plus documented host/APK upgrade order. |

### Compatibility research (snapshot; re-check before implementation)

| Backend | Evidence and tradeoff | Audit decision |
|---|---|---|
| [HIDMaestro](https://github.com/hifihedgehog/HIDMaestro) | Active MIT project; claims XInput and C# SDK. Current source describes **.NET 10**, first-use **administrator permissions**, local trusted self-signed signing certificate/UMDF2 and machine-wide driver changes. This is **not** guaranteed plug-and-play with WinDock's `net8.0-windows` helper. Third-party self-reported latency does not measure phone/network latency. | **Primary no-license-cost feasibility candidate**, not selected. Isolate/investigate .NET runtime strategy and elevation first; test XInput before any bundling. |
| [libvirtualhid](https://github.com/LizardByte/libvirtualhid) | Actively developed Windows UMDF2/VHF/XUSB backend with Xbox support per current repo; **machine license required** for Windows virtual device, separate source-available driver terms. Windows 11 AMD64 primary, Windows 10 best-effort and ARM64 release limitations. | **Technically interesting alternative**; hold unless Windows driver license acceptable and redistributable rights verified. |
| [ViGEmBus](https://github.com/nefarius/ViGEmBus) | Familiar free signed driver with Xbox 360 + DS4 support but **archived/retired since 2023**, potential security/maintenance risk. | **Compatibility baseline / fallback for controlled experiments**, not automatic default distribution. |

**Important:** HIDMaestro and libvirtualhid descriptions are developer claims and docs, not independently verified installation results. Never imply a signed or safe setup without real clean-Windows testing. Don't elevate the always-on WinDock Node host merely to create virtual controllers.

### Best practical milestone sequence

1. **Feasibility gate (P2, run immediately):** evaluate Xbox/XInput virtual device on clean Windows, install permissions and credentials, .NET integration path, no undesirable system trust changes, dispose/uninstall. Decide *go/no-go* and document.
2. **Thin navigation gate (P1, parallel):** third mode in Touch & sign and one-tap switches, with explicit UI-only preview; regressions checked. No polished layout editor yet.
3. **End-to-end minimum playable vertical slice (NEW gate VS1):** one native Android left stick + A, paired PC using simpler existing authenticated persistent WebSocket route initially, Windows virtual device seen by XInput test/game. Show neutral on loss.
4. **Full controller + accessibility:** add selectable controls, multiple analog sticks, D-pad/ABXY/LB/RB/LT/RT/Menu/View, editor/profile persistence, multi-pointer correctness, safe scaling for phone sizes.
5. **Reliability + transport optimization:** network watchdog, simultaneous inputs, reconnect, input security; compare WebSocket vs native UDP over Wi-Fi and USB tether; only implement second transport if gain merits security/maintenance costs.
6. **Game and usability testing:** real phone/PC/game compatibility, stuck-button failures, battery/heat, latency samples and regression tests for all WinDock modes.
7. **Packaging and release:** secure runtime/driver install paths, rollback, first-run help, compatibility matrix, test evidence, signed dependency/driver distribution rights, supported Windows versions.

These are **execution gates** layered onto existing P0–P7 checklist; they do not imply phases already passed. VS1 has highest product value after P2.

## UX acceptance details missing from original proposal

- Thumb zones should fit small and large phones in **landscape**, respect Android insets/cutouts, and keep one-hand/short-reach layouts possible. Test both short and wide aspect ratios.
- Analog stick options: **fixed** vs **floating** initial center (user-selectable), ring visualization, deadzone calibration, release-to-zero under `ACTION_CANCEL`, logical left/right assignment for one stick. Floating joystick center must never jump between pointer IDs.
- Edit Layout interaction must clearly signal **EDIT MODE**; disable game outputs, prevent unintended tap while dragging, offer Undo/Reset and a safe minimum touch size.
- Long-press and multi-touch: tap A while holding a stick, LT analog while moving stick, LB + RB with both sticks; app must not steal system gestures unexpectedly.
- Accessible size and contrast settings; alternative D-pad/button layouts; simple Full/Single Stick/Racing/Minimal profiles; prevent overlaps and accidental Back/Exit presses.
- Haptics are **explicitly excluded**, not "maybe later."

## Instrumentation and acceptance evidence

For each tested input path, document `phone + Android version`, `PC + Windows version`, `transport`, `driver/version`, `game or controller test program`, `sample count`, and measured `p50/p95/p99` plus loss/jitter. State whether clocks were synchronized and what interval is measured. Under no circumstances call ~35 microseconds driver-local or a ping RTT the user-observed game latency.

Tests must include: touch down/up under rapid taps, joystick extremes/deadzone, diagonal D-pad, analog trigger ramp, simultaneous fingers, portrait/landscape transitions, phone screen off, WinDock host restart, driver process crash, Wi-Fi dropout, USB mode switching, unpaired access, replay/oversize/invalid input, and anti-cheat-restricted game caveats.

## Go/no-go decisions to record before full implementation

- [ ] **D1:** Windows virtual driver/backend chosen and native proof running on target Windows 10/11, signed/installable/fully removable.
- [ ] **D2:** .NET 8 vs .NET 10 migration/isolation strategy accepted and installation privilege model understood.
- [ ] **D3:** Native Android↔WebView session/navigation contract tested, including one-tap return and background safety.
- [ ] **D4:** Minimal VS1 real phone → Windows XInput device works with neutral watchdog.
- [ ] **D5:** Baseline network path measured; UDP chosen *only* if evidence justifies complexity.
- [ ] **D6:** Compatibility, privacy and explicit expected latency measurement definition accepted.
- [ ] **D7:** Packaging/driver redistributability + clean install/uninstall validated.

## Sources

- WinDock fork source: `native/win/WinDockHelper.csproj` (`.NET 8`), `android/app/src/main/java/com/windock/app/MainActivity.kt`, `public/input-pad.js`, `server.js`, `.github/workflows/ci.yml`.
- [HIDMaestro GitHub](https://github.com/hifihedgehog/HIDMaestro) and [platform support](https://hidmaestro.org/docs/start/platform-support/) (user-mode driver details, SDK and permissions).
- [libvirtualhid source](https://github.com/LizardByte/libvirtualhid) and [Windows driver documentation](https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md) (driver support/licensing).
- [ViGEmBus archive](https://github.com/nefarius/ViGEmBus).
- [Android MotionEvent reference](https://developer.android.com/reference/android/view/MotionEvent).
