# WinDock P2: Windows read-only XInput slot baseline.
# Requires only built-in Windows PowerShell 5.1. No .NET SDK or admin.
# Calls XInputGetState only, never creates/modifies any controller.
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
    throw 'This read-only baseline requires Windows.'
}
if (-not ('WinDock.GamepadBaseline.Native' -as [type])) {
    Add-Type -ErrorAction Stop -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace WinDock.GamepadBaseline {
    [StructLayout(LayoutKind.Sequential)]
    public struct Pad {
        public ushort Buttons;
        public byte LT, RT;
        public short LX, LY, RX, RY;
    }
    [StructLayout(LayoutKind.Sequential)]
    public struct State {
        public uint PacketNumber;
        public Pad Gamepad;
    }
    public static class Native {
        [DllImport("xinput1_4.dll", EntryPoint="XInputGetState", ExactSpelling=true)]
        public static extern uint XInputGetState(uint index, out State state);
    }
}
'@
}
Write-Output 'WinDock P2 BASELINE (read only; no driver or certificate changes)'
Write-Output ('windows_version={0}' -f [Environment]::OSVersion.Version)
Write-Output ('os_architecture={0}' -f [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture)
Write-Output ('process_architecture={0}' -f [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture)
Write-Output 'XInput slots; physical and virtual devices look identical here.'
$connected = 0
for ($slot = 0; $slot -lt 4; $slot++) {
    $state = New-Object WinDock.GamepadBaseline.State
    $result = [WinDock.GamepadBaseline.Native]::XInputGetState([uint32]$slot, [ref]$state)
    if ($result -eq 1167) {
        Write-Output ('slot={0} disconnected' -f $slot)
    } elseif ($result -eq 0) {
        $connected++
        $pad = $state.Gamepad
        Write-Output ('slot={0} buttons=0x{1:X4} A={2} B={3} LX={4} LY={5} RX={6} RY={7} LT={8} RT={9}' -f
            $slot, [int]$pad.Buttons, [bool]($pad.Buttons -band 0x1000),
            [bool]($pad.Buttons -band 0x2000), $pad.LX, $pad.LY,
            $pad.RX, $pad.RY, $pad.LT, $pad.RT)
    } else {
        throw ('XInput slot {0} returned error {1}' -f $slot, $result)
    }
}
Write-Output ('connected_slots={0}' -f $connected)
