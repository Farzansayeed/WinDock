# P2 — Windows virtual Xbox controller feasibility and acceptance gate

**Status:** RESEARCH / TEST PLAN ONLY. No driver selected, installed, redistributed, or tested on a Windows machine.  
**Last reviewed:** 2026-10-23.  
**Owner fork:** [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock), branch `feature/universal-gamepad`.  
**Next step:** a separate, removable, test-only Windows proof that a controller appears to **XInput**, not merely as a generic USB/HID device. No action here elevates or changes the user's Windows machine.

## Why P2 gates subsequent development

The Android touch UI is achievable using the existing WinDock Kotlin application, but a Windows-recognized Xbox-compatible virtual device requires an actual Windows driver/backend. The wrong backend could make the controller unusable in many games or require uncomfortable administrator/certificate trust changes. Validate that **before** building the full editor or fast UDP path. A visual Gamepad preview is already implemented in P1 but is deliberately unconnected to games.

## Candidate evidence — not validation

| Candidate | Potential | Non-negotiable concern | Decision |
|---|---|---|---|
| [HIDMaestro](https://github.com/hifihedgehog/HIDMaestro) | MIT repository; claims XInput/SDL/DirectInput device emulation and C# SDK | Current README says **.NET 10**, **elevated install**, local trust of a self-signed driver certificate/UMDF2. Current WinDock Windows helper is `net8.0-windows`. Never silently add trust roots or assume drop-in binary compatibility. | **TEST CANDIDATE**; use isolated .NET 10 proof/sidecar if viable; don't upgrade all WinDock before assessment |
| [libvirtualhid](https://github.com/LizardByte/libvirtualhid) | Actively developed virtual Windows HID/XUSB capabilities | Windows driver-backed use **requires a license**, with source-available component terms distinct from the library MIT license. Windows version support and redistribution must be assessed. | **ALTERNATIVE** only if terms acceptable |
| [ViGEmBus](https://github.com/nefarius/ViGEmBus) | Familiar historical virtual Xbox 360 compatibility | Repository is **archived**; retired driver, long-term maintenance and security concerns. | **LAB COMPARISON ONLY**, not an automatic distribution choice |

Source statements are developer claims, not independently verified. Re-check upstream repository, releases, supported OS, licensing and signing documentation at the time of testing.

## Minimum Windows proof (P2 acceptance)

- [ ] Test on isolated Windows 10/11 machine or disposable VM snapshot, with clean baseline and system architecture recorded (x64/ARM64 as relevant).
- [ ] Confirm whether required binaries and drivers are **signed, maintained, installable**, license-compliant and redistributable; no disabled signature enforcement or Test Signing Mode.
- [ ] Record every administrator/UAC prompt, certificate installed into Windows trust stores, service and driver package, and any machine-wide registry modification. Obtain user confirmation for sensitive installation. Never elevate the normal WinDock Node server.
- [ ] Create a controller using a small disposable **standalone** test harness (not production WinDock) and verify **Xbox-compatible XInput visibility** with a test tool; `joy.cpl` visibility alone is insufficient.
- [ ] Submit A pressed/released, analog stick at center/min/max, analog triggers and multiple simultaneous controls; verify output not just API calls.
- [ ] Release neutral, terminate test process unexpectedly, then check driver ownership and stale virtual devices are safely reclaimed.
- [ ] Remove test device and uninstall dependencies cleanly; validate Windows stays in a trusted and recoverable state.
- [ ] Decide if `net8.0-windows` can interface via a **separate .NET 10 sidecar or narrow IPC** rather than requiring wholesale runtime migration.
- [ ] Document OS-specific failures, XInput slot conflicts, Steam Input interaction, game compatibility limits, admin necessity, and complete rollback.
- [ ] Only after all gates choose an adapter for `src/platform/windows.js` and a managed native receiver interface; do not hard-code SDK-specific types into Android/network protocol.

## Suggested execution path

1. Do non-invasive capability and documentation checks: Windows version, architecture, supported .NET SDK and build tools, backend legal terms, signing model.
2. On a **separate clean test environment**, install the candidate exactly as its current documentation says, after inspecting elevated actions and certificate modifications; capture install artifacts and rollback steps.
3. Run minimal native controller local-state test, independently of Android and WinDock; check `XInputGetState` or a trustworthy gamepad tester.
4. Validate cleanup/recovery, unplug/driver restart, process crash and ordinary unprivileged steady-state usage.
5. Record evidence in [PROGRESS.md](PROGRESS.md) / [WORKLOG.md](WORKLOG.md); choose backend only with verified deployment tradeoffs.
6. Proceed to **VS1**: one native Kotlin left stick + A over existing authenticated WinDock connection to that Windows controller, with a native neutral watchdog. Only then implement all UI control groups and benchmark UDP.

## Boundaries / no-go conditions

- Do not install a machine-trusted root certificate or disable Windows kernel signing as an undocumented side effect.
- Do not ship an unsigned driver, copy a paid licensed driver into this fork, or make the original Node host elevated.
- Do not claim universal game or anti-cheat compatibility; some software intentionally disallows virtual input.
- Do not claim measured touch-to-game latency based on a driver-only benchmark.
- Do not add haptics or gyroscope to initial scope.

## Pending information / evidence

**P2 remains NOT STARTED as an install/proof-of-concept.** No physical Windows host accessible through this GitHub integration, no Windows driver binary tested, and no Windows admin action undertaken. P1 preview and its mock DOM navigation tests are separate from this gate.
