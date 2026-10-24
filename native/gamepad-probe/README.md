# WinDock P2 — read-only Windows XInput diagnostic

This is a **safe-to-run, read-only** console tool. It uses Windows' built-in `XInputGetState` to show the four available XInput slots and input values. It **never** creates a controller, installs a driver, asks for elevation, changes certificate trust, opens a firewall port, sends gamepad input, or modifies WinDock's existing PC host.

It is **not a virtual controller implementation**. It cannot tell whether an Xbox-compatible controller is physical or virtual; compare a baseline before starting any separate device-emulation test application.

## Recommended: SDK-free PowerShell baseline (Windows 10/11)

No .NET SDK, WinDock pairing, Android device, administrator permission, driver installation or certificate change is required for the baseline. Windows PowerShell 5.1 is included with Windows 10/11. [WinDock-XInputBaseline.ps1](WinDock-XInputBaseline.ps1) calls only the built-in Windows XInputGetState function to read four controller slots. It works from **any current PowerShell directory**, including C:\WINDOWS\system32, as long as you provide the correct script path.

Download the standalone script from the linked repository file page (**Download raw file**) into your Downloads folder. Inspect its contents, then run it in normal Windows PowerShell:

```powershell
& "$env:USERPROFILE\Downloads\WinDock-XInputBaseline.ps1"
```

If your Windows script execution policy blocks this, report the error rather than changing a machine-wide policy. The diagnostic is a read-only PowerShell script; the original .NET SDK is optional. Expected lines are `windows_version=`, `os_architecture=`, slots `0` through `3`, and `connected_slots=N`. **Four disconnected slots (`connected_slots=0`) are a normal baseline**. Any connected slot could represent an already-installed physical or virtual controller; this tool cannot distinguish them.

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

Windows CI tests the SDK-free PowerShell baseline from System32, then separately builds the optional .NET 8 diagnostic and runs its help/baseline paths. Node also checks both sources for read-only safety boundaries. Neither test can establish that a real XInput controller works, so hardware gate remains outstanding.
