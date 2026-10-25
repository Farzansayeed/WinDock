# WinDock P2 — read-only Windows XInput diagnostic

## 2026-10-25 owner P2 audit hash failure — identified old v28, not executable malfunction

**Owner's verbatim reported hash:** `42DB320E839F41454B5A7C0867A71447C7DD5B2731EB2E74571818708E742225`. GitHub release asset metadata for the **v28** `WinDockGamepadProbe-win-x64.exe` matches exactly. Verified v39 x64 asset digest is `A9FCD7236D22868771318CA1991725C52E92B711CA04E9765C53FABD03690048`. Therefore the path previously used in Downloads points to an older v28 binary, not the v39 audit tool. **Both owner checklist items remain UNCHECKED/NOT WORKING; `--backend-audit` NOT RUN.** This is a stale filename collision, NOT a failed P2 backend inspection; no driver or certificate changes occurred.

**Fix:** Starting with the next CI-built Preview, publish the probe a second time under a **version- and commit-specific filename**, include both distinct names in SHA256SUMS and assert their hashes match the legacy aliases. Preserve old asset names for compatibility. Owner should download and execute only the newly versioned x64 asset after matching its SHA256 from the SAME GitHub release, then use `--backend-audit` in normal non-admin PowerShell. No rerun of the already accepted four-slot XInput scan, Windows Preview installer, Android app, or original WinDock regressions.



**AVAILABLE IN VERIFIED PREVIEW v38:** [Release](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.38-g6141f36) includes the portable `WinDockGamepadProbe-win-x64.exe` with new **`--backend-audit`**. The [all-platform CI](https://github.com/Farzansayeed/WinDock/actions/runs/40175034190) and [packaging workflow](https://github.com/Farzansayeed/WinDock/actions/runs/40175034205) passed. Download `SHA256SUMS.txt` from the SAME release, compare SHA256 before executing in a normal nonadmin PowerShell; do NOT reinstall WinDock or repeat the previously accepted `--baseline`. This is an audit, not a driver installer, privileged test, or gameplay. Windows x64 CI ran audit; owner's physical machine not yet checked.

## Diagnostic, NOT setup

The `WinDockGamepadProbe-win-x64.exe` and `WinDockGamepadProbe-win-arm64.exe` files **only inspect XInput slots**; they do not install or start WinDock. Never delete/uninstall WinDock to run this diagnostic. For Windows Gamepad Preview installation use the **different** `WinDockGamepadPreviewSetup.exe` from the same verified [release](https://github.com/Farzansayeed/WinDock/releases), after checking SHA256SUMS. That installs a separate Preview, not the regular WinDock edition. [Full installer guidance](../../docs/gamepad/INSTALL-PREVIEW.md).


This is a **safe-to-run, read-only** console tool. It uses Windows' built-in `XInputGetState` to show the four available XInput slots and input values. It **never** creates a controller, installs a driver, asks for elevation, changes certificate trust, opens a firewall port, sends gamepad input, or modifies WinDock's existing PC host.

It is **not a virtual controller implementation**. It cannot tell whether an Xbox-compatible controller is physical or virtual; compare a baseline before starting any separate device-emulation test application.

## When double-clicking the downloaded EXE (Windows Explorer)

**Owner observation, 2026-10-24:** After Windows displayed its normal downloaded-application prompt and the owner clicked Run, v28 flashed a command window briefly and exited. This is consistent with the existing **console-only** diagnostic completing a no-argument scan; it does **not** by itself show that XInput failed or that a virtual controller exists. The downloaded EXE runs a one-time report and does not leave a resident gamepad service.

**From the next release containing the interactive fix:** after verifying the file checksum and if the executable is permitted by Windows security, double-click the matching `WinDockGamepadProbe-win-x64.exe` (or ARM64). With **no command-line arguments**, the app now prints Windows version, architecture, XInput slots 0–3 and the total slot count, then shows **"Press Enter to close this read-only report..."**. Leave the window open, read/copy the report, and only then press Enter. No admin or separate .NET SDK is needed. Empty slots (`connected_slots=0`) are normal.

**If the EXE is blocked by security policy**, stop and report the exact message; don't disable SmartScreen, antivirus, execution policy or signing requirements. If you prefer a terminal that remains open even for older v28, launch the downloaded EXE from an already open non-admin PowerShell using `& "$env:USERPROFILE\Downloads\WinDockGamepadProbe-win-x64.exe" --baseline`. A no-args double-click in **v28** can appear to do nothing even when the probe actually executed; v28 does not pause.

## Recommended: script-free portable Windows XInput baseline

The owner's unsigned PowerShell .ps1 file was blocked by Windows execution policy (PSSecurityException: file is not digitally signed). The previous dotnet run command also failed because no .NET SDK is installed. **Do not change PowerShell execution policy or Windows certificate trust to run this diagnostic.**

On the latest **published numbered Gamepad Preview release**, download WinDockGamepadProbe-win-x64.exe for Intel/AMD Windows or WinDockGamepadProbe-win-arm64.exe for ARM64 Windows. Verify the downloaded file's SHA-256 against the matching entry in SHA256SUMS.txt, and check BUILD-INFO.txt for the release commit.

Normal (not administrator) PowerShell from any directory, assuming x64 file in Downloads:

    Get-FileHash "$env:USERPROFILE\Downloads\WinDockGamepadProbe-win-x64.exe" -Algorithm SHA256
    & "$env:USERPROFILE\Downloads\WinDockGamepadProbe-win-x64.exe" --baseline

The first command displays a hash for comparison. The second prints windows_version, os_architecture, slots 0..3 and connected_slots=N. Zero connected slots is normal. No .NET SDK, separate runtime install, script execution, pairing, driver, certificate change or elevation. The portable EXEs are **UNSIGNED**: if SmartScreen, Windows Defender, AppLocker, WDAC or organization policy blocks them, report the warning; **do not bypass or disable any protection**. x64 is executed on Windows CI, ARM64 only cross-built. This only reads Windows XInput and does NOT validate a real virtual Xbox controller or PC game control.

## Alternative: SDK-free PowerShell baseline (only when unsigned scripts are allowed)

No .NET SDK, WinDock pairing, Android device, administrator permission, driver installation or certificate change is required for the baseline. Windows PowerShell 5.1 is included with Windows 10/11. [WinDock-XInputBaseline.ps1](WinDock-XInputBaseline.ps1) calls only the built-in Windows XInputGetState function to read four controller slots. It works from **any current PowerShell directory**, including C:\WINDOWS\system32, as long as you provide the correct script path.

Download the standalone script from the linked repository file page (**Download raw file**) into your Downloads folder. Inspect its contents, then run it in normal Windows PowerShell:

```powershell
& "$env:USERPROFILE\Downloads\WinDock-XInputBaseline.ps1"
```

If script execution is blocked, try the portable release EXE above only if Windows application policy permits it; do not weaken execution policy. The diagnostic is a read-only PowerShell script; the original .NET SDK is optional. Expected lines are `windows_version=`, `os_architecture=`, slots `0` through `3`, and `connected_slots=N`. **Four disconnected slots (`connected_slots=0`) are a normal baseline**. Any connected slot could represent an already-installed physical or virtual controller; this tool cannot distinguish them.

## Optional legacy .NET 8 SDK diagnostic (developers only)

Only use this alternative if the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) is already installed. Commands below require a **repository checkout** and must be run from its **root**, not System32. You do not need to install the SDK just to complete this baseline.

## Commands (in a terminal at the repository root)

```powershell
dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --help
dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --scan
dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --baseline
dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --watch 10
```

- `--scan` prints slot 0–3 availability and the current state.
- `--baseline` additionally prints Windows version and OS/process architecture. It does not print device identifiers, user profile details, tokens or certificates. Run without administrator privileges. A zero-slot result is a valid baseline and does **not** block progress.
- `--watch 10` samples for 10 seconds and prints only state changes (buttons, axes and triggers; no synthetic input). Accepts 1–60 seconds.
- `A=True` represents the Xbox A-button bit; `LX/LY/RX/RY` are signed axes; `LT/RT` are 0–255. If all slots are disconnected, that is a **normal pre-driver baseline**, not a failed build.
- Use the same commands before and after starting a **separately vetted** virtual-controller demonstration and with physical controllers unplugged. A newly appearing XInput slot is **supporting evidence**, not proof of safe installation or game compatibility.

## P2 gate is still OPEN

No virtual driver has been installed or selected. A complete P2 proof also needs real Windows 10/11 device recognition, certified install/clean rollback, license/redistribution and elevation/certificate review, and controlled unexpected-exit tests. See [driver acceptance plan](../../docs/gamepad/P2-DRIVER-FEASIBILITY.md).

Do not install HIDMaestro, ViGEmBus or third-party certificates simply to try this diagnostic. If later testing an external driver, review exactly what its own installer changes first and record user-approved steps.

## Automated verification

Windows CI tests the PowerShell baseline from System32 and separately builds the .NET diagnostic. Preview release CI packages portable x64/ARM64 binaries and runs the self-contained x64 EXE --help/--baseline from System32. ARM64 execution requires separate hardware. Node also checks both sources for read-only safety boundaries. Neither test can establish that a real XInput controller works, so hardware gate remains outstanding.


## New P2 backend readiness audit (read-only, no repeat of XInput baseline)

The portable diagnostic bundled in the first published Preview after this
change also supports a **different** read-only mode:

```powershell
& "$env:USERPROFILE\Downloads\WinDockGamepadProbe-win-x64.exe" --backend-audit
```

Run in an **ordinary, non-administrator** PowerShell window if Windows
normally permits the executable. Compare its SHA256 to the release
\`SHA256SUMS.txt\` before running; no .NET SDK, PowerShell script execution,
extra runtime, pairing, driver, certificate installation, licence, or network
access is required. **Do not run as administrator, disable SmartScreen,
alter execution policy or change trust** if security blocks the EXE.
This audit is NOT a Windows Preview installer and changes no WinDock data.

The audit reports OS/process architecture, whether an x64 .NET 10 shared
runtime is *registered* (a self-contained runtime may not be), and only
\`present\` / \`not_detected\` / \`unavailable\` for a matching
\`CN=HIDMaestroTestCert\` public certificate in the three machine stores:
Root, TrustedPublisher and My. It reports **no identities, subjects,
fingerprints, private keys, network destinations or controller state**. A
matching name does not authenticate a certificate's publisher; neither its
presence nor absence proves driver installation or clean rollback. If a
store is inaccessible, \`unavailable\` is a valid non-destructive result.

**Expected success:** \`backend_audit_version=1\`, Windows version and
architecture, one runtime indicator, three certificate-store indicators, then
\`device_or_driver_installation_performed=no\`,
\`certificate_trust_changed=no\`, and \`controller_created=no\`. All
three possible store-indicator values are acceptable *read-only audit
outcomes*. The already accepted four-slot XInput baseline need not be
rerun. This new read-only physical report informs P2 readiness only; **do
not install a driver or accept an elevation prompt** in response to it.
