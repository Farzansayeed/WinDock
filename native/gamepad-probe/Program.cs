using System.Diagnostics;
using System.Runtime.InteropServices;

namespace WinDock.GamepadProbe;

/// <summary>
/// Read-only XInput slot diagnostic. DOES NOT create devices, install drivers,
/// modify certificates, send controller input, or elevate the WinDock host.
/// XInput visibility does not itself establish that a device is virtual.
/// </summary>
internal static class Program
{
    private const uint ErrorSuccess = 0;
    private const uint ErrorDeviceNotConnected = 1167;
    private const int MaxSlots = 4;

    [StructLayout(LayoutKind.Sequential)]
    private struct XInputGamepad
    {
        public ushort Buttons;
        public byte LeftTrigger;
        public byte RightTrigger;
        public short ThumbLX;
        public short ThumbLY;
        public short ThumbRX;
        public short ThumbRY;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct XInputState
    {
        public uint PacketNumber;
        public XInputGamepad Gamepad;
    }

    // Windows 10/11 system DLL. Only the read-only call is imported.
    [DllImport("xinput1_4.dll", EntryPoint = "XInputGetState", ExactSpelling = true)]
    private static extern uint XInputGetState(uint userIndex, out XInputState state);

    private static int Main(string[] args)
    {
        // Launching an EXE from Explorer supplies no arguments. Show a useful
        // full baseline and keep its console readable instead of flashing away.
        // Explicit --baseline/--scan/--watch remain non-interactive for CI.
        var directLaunch = args.Length == 0;
        try
        {
            return Run(args);
        }
        finally
        {
            // When stdout/stdin are redirected, never wait and never alter
            // automation behavior. Normal Explorer consoles stay visible.
            if (directLaunch && !Console.IsInputRedirected && !Console.IsOutputRedirected)
            {
                try
                {
                    Console.WriteLine();
                    Console.Write("Press Enter to close this read-only report...");
                    Console.ReadLine();
                }
                catch (IOException) { }
                catch (InvalidOperationException) { }
            }
        }
    }

    private static int Run(string[] args)
    {
        // --help is intentionally safe on non-Windows CI too: never load a driver.
        if (args.Length == 1 && args[0] == "--help")
        {
            Console.WriteLine("WinDock read-only XInput probe (no driver installation)");
            Console.WriteLine("Usage: dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- [--scan | --baseline | --watch SECONDS]");
            Console.WriteLine("  (double-click)   Display read-only baseline; press Enter to close.");
            Console.WriteLine("  --scan           List currently visible XInput slots.");
            Console.WriteLine("  --baseline       Read OS version/architecture and XInput slots; NO identifiers, admin or driver changes.");
            Console.WriteLine("  --backend-audit  Inspect runtime/certificate presence (booleans only); NO driver, trust or input changes.");
            Console.WriteLine("  --watch SECONDS  Observe button/axis changes for 1..60 seconds.");
            Console.WriteLine("This program cannot distinguish a physical pad from a virtual pad. Compare before/after.");
            return 0;
        }

        // New P2 safety audit does not call XInput or perform a baseline again.
        if (args.Length == 1 && args[0] == "--backend-audit")
            return BackendAudit.Run();

        bool watch = false;
        bool baseline = args.Length == 0 || (args.Length == 1 && args[0] == "--baseline");
        int watchSeconds = 0;
        if (baseline || args.Length == 0 || (args.Length == 1 && args[0] == "--scan"))
        {
            // No options: readable baseline for the double-click path.
        }
        else if (args.Length == 2 && args[0] == "--watch" &&
                 int.TryParse(args[1], out watchSeconds) &&
                 watchSeconds is >= 1 and <= 60)
        {
            watch = true;
        }
        else
        {
            Console.Error.WriteLine("Invalid arguments; use --help.");
            return 2;
        }

        if (!OperatingSystem.IsWindows())
        {
            Console.Error.WriteLine("XInputGetState requires Windows 10/11.");
            return 3;
        }

        try
        {
            if (!watch)
            {
                if (baseline)
                {
                    // Intentionally no hostname, user, serial, hardware ID,
                    // installed certificate or other machine identifier.
                    Console.WriteLine("WinDock P2 BASELINE: read-only, no admin and no driver changes.");
                    Console.WriteLine($"windows_version={Environment.OSVersion.Version}");
                    Console.WriteLine($"os_architecture={RuntimeInformation.OSArchitecture}");
                    Console.WriteLine($"process_architecture={RuntimeInformation.ProcessArchitecture}");
                    Console.WriteLine("Physical and virtual XInput controllers cannot be distinguished here.");
                }
                Console.WriteLine("XInput slot scan (read only).");
                int connected = 0;
                for (uint index = 0; index < MaxSlots; index++)
                {
                    var result = XInputGetState(index, out var state);
                    if (result == ErrorSuccess)
                    {
                        connected++;
                        Console.WriteLine(Format(index, state));
                    }
                    else if (result == ErrorDeviceNotConnected)
                    {
                        Console.WriteLine($"slot={index} disconnected");
                    }
                    else
                    {
                        Console.Error.WriteLine($"slot={index} XInputGetState error={result}");
                        return 4;
                    }
                }
                Console.WriteLine($"connected_slots={connected}");
                return 0;
            }

            Console.WriteLine($"Watching XInput for {watchSeconds}s. This only READS controller state.");
            var last = new string?[MaxSlots];
            var clock = Stopwatch.StartNew();
            do
            {
                for (uint index = 0; index < MaxSlots; index++)
                {
                    var result = XInputGetState(index, out var state);
                    string snapshot = result switch
                    {
                        ErrorSuccess => Format(index, state),
                        ErrorDeviceNotConnected => $"slot={index} disconnected",
                        _ => $"slot={index} XInputGetState error={result}"
                    };
                    if (snapshot != last[index])
                    {
                        Console.WriteLine($"t={clock.ElapsedMilliseconds}ms {snapshot}");
                        last[index] = snapshot;
                    }
                    if (result != ErrorSuccess && result != ErrorDeviceNotConnected)
                    {
                        return 4;
                    }
                }
                Thread.Sleep(25); // diagnostic polling only; NOT gameplay scheduling
            } while (clock.Elapsed.TotalSeconds < watchSeconds);
            return 0;
        }
        catch (DllNotFoundException)
        {
            Console.Error.WriteLine("Windows xinput1_4.dll is not available.");
            return 5;
        }
        catch (EntryPointNotFoundException)
        {
            Console.Error.WriteLine("Windows XInputGetState entry point is missing.");
            return 5;
        }
        catch (BadImageFormatException)
        {
            Console.Error.WriteLine("XInput DLL architecture is not compatible.");
            return 5;
        }
    }

    private static string Format(uint index, XInputState state)
    {
        var gp = state.Gamepad;
        // PacketNumber is deliberately excluded: many drivers increment it
        // continuously even without any actual button/axis state change.
        return $"slot={index} buttons=0x{gp.Buttons:X4} A={((gp.Buttons & 0x1000) != 0)} " +
               $"B={((gp.Buttons & 0x2000) != 0)} " +
               $"LX={gp.ThumbLX} LY={gp.ThumbLY} RX={gp.ThumbRX} RY={gp.ThumbRY} " +
               $"LT={gp.LeftTrigger} RT={gp.RightTrigger}";
    }
}
