# WinDock P2 — read-only Windows XInput diagnostic

This is a **safe-to-run, read-only** console tool. It uses Windows' built-in `XInputGetState` to show the four available XInput slots and input values. It **never** creates a controller, installs a driver, asks for elevation, changes certificate trust, opens a firewall port, sends gamepad input, or modifies WinDock's existing PC host.

It is **not a virtual controller implementation**. It cannot tell whether an Xbox-compatible controller is physical or virtual; compare a baseline before starting any separate device-emulation test application.

## Prerequisites

Windows 10 or Windows 11 with the [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0). No Android phone or WinDock pairing is needed for this diagnostic.

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

The Windows CI job builds this diagnostic with .NET 8 and runs its `--help` path. The Node test suite also checks its read-only source and explicit no-installer boundaries. Neither test can establish that a real XInput controller works, so hardware gate remains outstanding.
