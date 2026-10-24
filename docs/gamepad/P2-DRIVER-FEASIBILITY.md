# P2 — Windows virtual Xbox controller feasibility and acceptance gate

**OCTOBER 26 RESUME:** See [HANDOFF-2026-10-26.md](HANDOFF-2026-10-26.md), [3d5bf3b](https://github.com/Farzansayeed/WinDock/commit/3d5bf3b90bf7579a809082b46f5021a5c5d05028), [CI #40131398154](https://github.com/Farzansayeed/WinDock/actions/runs/40131398154) and [Preview workflow #40131398148](https://github.com/Farzansayeed/WinDock/actions/runs/40131398148) passed, [Preview v32](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.32-g3d5bf3b) published. Owner physically ACCEPTED Windows x64 XInput read-only 4 disconnected slots `connected_slots=0`. Real virtual Xbox backend remains unselected/unapproved; don't infer Xbox output or request privilege/certificate changes. Earlier notes below are historical.

**Status:** RESEARCH + READ-ONLY XINPUT DIAGNOSTIC ADDED; driver-neutral authenticated /gamepad WebSocket and independent native watchdog implemented/tested in CI. **No driver selected, installed, licensed, redistributed, or physically tested**. A built diagnostic and simulated state tests cannot prove XInput output.  
**Last reviewed:** 2026-10-25.  
**Owner fork:** [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock), branch `feature/universal-gamepad`.  

## Owner's Windows read-only XInput baseline — physical report 2026-10-25

The owner reported a real scan on x64 Windows, `windows_version=10.0.26300.0`, `os_architecture=X64`, `process_architecture=X64`, slots 0–3 all disconnected, and `connected_slots=0`, followed by `Press Enter to close this read-only report...`. This is **technically a successful baseline**: the read-only tool read all four XInput slots and found zero connected controllers at the moment of scan. Zero is normal before a virtual controller is implemented; it neither proves installed physical/virtual drivers nor demonstrates gameplay. The owner submitted the scan as **NOT WORKING / NOT CHECKED**; preserve that acceptance gate until explicitly acknowledged (do not silently flip checked state). Hash and exit code not provided; do not claim them. No need to rerun the scan, change Windows security, or install drivers. Any subsequent virtual Xbox driver testing remains separately approval-gated.

**Current next step:** The owner has **completed and explicitly accepted** the [read-only Windows XInput baseline](../../native/gamepad-probe/README.md) on x64 Windows 10.0.26300.0 (all four slots disconnected, connected_slots=0). No repeat scan is necessary. Continue driver-neutral protocol/IPC/neutral-state tests, and only later consider any separately approved rollback-capable physical virtual-controller test after examining current driver signatures, licence redistribution and fully offline behavior. No approval to install drivers, request elevation, alter certificates or buy licences.

## Why P2 gates subsequent development

The Android touch UI is achievable using the existing WinDock Kotlin application, but a Windows-recognized Xbox-compatible virtual device requires an actual Windows driver/backend. The wrong backend could make the controller unusable in many games or require uncomfortable administrator/certificate trust changes. Validate that **before** building the full editor or fast UDP path. A visual Gamepad preview is already implemented in P1 but is deliberately unconnected to games.

## Candidate evidence — not validation

| Candidate | Potential | Non-negotiable concern | Decision |
|---|---|---|---|
| [HIDMaestro](https://github.com/hifihedgehog/HIDMaestro) | MIT repository; claims XInput/SDL/DirectInput device emulation and C# SDK | Current README says **.NET 10**, **elevated install**, local trust of a self-signed driver certificate/UMDF2. Current WinDock Windows helper is `net8.0-windows`. Never silently add trust roots or assume drop-in binary compatibility. | **TEST CANDIDATE**; use isolated .NET 10 proof/sidecar if viable; don't upgrade all WinDock before assessment |
| [libvirtualhid](https://github.com/LizardByte/libvirtualhid) | Actively developed virtual Windows HID/XUSB capabilities | Windows driver-backed use **requires a license**, with source-available component terms distinct from the library MIT license. Windows version support and redistribution must be assessed. | **ALTERNATIVE** only if terms acceptable |
| [ViGEmBus](https://github.com/nefarius/ViGEmBus) | Familiar historical virtual Xbox 360 compatibility | Repository is **archived**; retired driver, long-term maintenance and security concerns. | **LAB COMPARISON ONLY**, not an automatic distribution choice |

Source statements are developer claims, not independently verified. Re-check upstream repository, releases, supported OS, licensing and signing documentation at the time of testing.

## Fresh upstream documentation review — 2026-10-24 (not a driver decision)

**HIDMaestro:** Official [prerequisites](https://hidmaestro.org/) state **.NET 10** and administrator privileges for virtual creation; [driver/install docs](https://hidmaestro.org/docs/reference/driver-install-and-signing/) say its installer signs UMDF2 packages with a locally created certificate and places that certificate in **LocalMachine Root, TrustedPublisher and My**. This is a real machine-trust modification: code must not perform it on a user's machine automatically, and the installation must have a reviewable rollback. [Build docs](https://hidmaestro.org/docs/reference/build-and-release/) mention a v2.0.1 uninstaller, but what it removes versus certificates/drivers must be audited. MIT source licensing is attractive for an entirely local product; **admin + certificate trust** remains the red-line. XInput compatibility claimed by upstream is not yet verified in WinDock on a real PC. Keep the prototype in a separate .NET 10 process, not a .NET 8 app-wide runtime upgrade.

**LizardByte libvirtualhid / Virtual HID Driver:** Official [Windows driver documentation](https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md) describes a production-signed AMD64 Windows 11 MSI, UMDF2 with an XUSB companion for Xbox 360 and a machine licence for driver-backed devices. Its [platform support](https://github.com/LizardByte/libvirtualhid/blob/master/docs/platform-support.md) lists Windows 11 21H2+ AMD64 primary and Windows 10 best-effort. **The separate Windows licence and online validation policy are major issues for this owner's completely local/no-cloud gameplay requirement.** Per vendor: normal licence validation is daily; a yearly licence may need online validation within 25h and after reboot; while offline, a lifetime licence can keep/create ONE licensed device, and other licences have limits. No private activation keys to be stored/logged by WinDock. This is therefore **not an approved free/offline backend**; use only if user affirmatively accepts pricing, network licensing tradeoffs and redistribution conditions.

**Retired ViGEmBus:** Some actively developed mapping tools still rely on the historical [archived/retired ViGEmBus](https://github.com/nefarius/ViGEmBus), but app-level maintenance does NOT make the underlying driver a maintained platform. It remains a laboratory comparison, not the default distribution choice.

**Decision for now:** NONE SELECTED. No driver installation, UAC, certificate store mutation, WindowsApps permission changes, firmware settings, forced driver signing bypass or package distribution. First gather Windows version/architecture and a read-only XInput baseline with the existing probe. Then ask for an explicit, informed approval to evaluate ONE current signed-backend installer in a recoverable lab machine/snapshot; test XInput slot, full stick/A/trigger reports, timer-driven neutral on all disconnects, uninstall, and persistence of certificate or driver changes. Until P2 is proven, /gamepad production sink must remain disabled and the Kotlin local preview must not claim working PC controls.

## Read-only diagnostic now available

A standalone `native/gamepad-probe/` .NET 8 project calls only Windows `XInputGetState`. It does not install, trust, or emit anything. It records Xbox-visible slots, A/button bits, stick axes, and analog triggers, and offers `--scan` and bounded `--watch`. [Usage and safety instructions](../../native/gamepad-probe/README.md).

**This is instrumentation, NOT driver feasibility success.** Actual .NET build/Windows run and driver install/rollback evidence must still be collected. Use physical controllers disconnected during before/after comparisons.

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

**P2 driver validation remains NOT STARTED as an install/proof-of-concept.** A read-only diagnostic project and CI checks are committed but Windows hardware/driver tests have not been performed. No physical Windows host accessible through this GitHub integration, no Windows driver binary tested, and no Windows admin action undertaken. P1 preview and its mock DOM navigation tests are separate from this gate.
