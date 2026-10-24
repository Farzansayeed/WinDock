using WinDock.Gamepad;
using System.Text;

// Explicit LAB MODE ONLY: no real controller backend is linked or available.
// The private, inherited stdio pipe is the entire receiver IPC surface.
internal sealed class FakeReportSink : IControllerReportSink
{
    private bool disposed;
    public void Write(ControllerState s)
    {
        if (disposed) throw new ObjectDisposedException(nameof(FakeReportSink));
        Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new {
            @event = "report", seq = s.Sequence, buttons = s.Buttons,
            lx = s.LX, ly = s.LY, rx = s.RX, ry = s.RY, lt = s.LT, rt = s.RT
        }));
    }
    public void Dispose()
    {
        if (disposed) return;
        disposed = true;
        Console.WriteLine("{\"event\":\"sink-disposed\"}");
    }
}
internal static class Program
{
    // Read at most 256 bytes PER LINE; oversized frames immediately fail
    // closed. BufferedStream avoids OS reads per byte.
    private static async Task<string?> ReadFrame(Stream input, CancellationToken ct)
    {
        var data = new byte[ControllerState.MaxFrameBytes];
        var one = new byte[1];
        int used = 0;
        while (true)
        {
            int n = await input.ReadAsync(one.AsMemory(), ct);
            if (n == 0) return null; // EOF, including partial frames
            if (one[0] == (byte)'\n')
            {
                try { return new UTF8Encoding(false, true).GetString(data, 0, used); }
                catch (DecoderFallbackException) { return "{}"; }
            }
            if (used == data.Length) return "{}"; // fail neutral, no unlimited allocation
            data[used++] = one[0];
        }
    }

    private static async Task<int> Main(string[] args)
    {
        if (args.Length != 1 || args[0] != "--fake-sink-test")
        {
            Console.Error.WriteLine("No approved XInput backend. Only --fake-sink-test is available.");
            return 64;
        }
        using var receiver = new ControllerReceiver(new FakeReportSink(),
            timeoutMs: 180, pollMs: 20);
        Console.WriteLine("{\"event\":\"ready\",\"v\":1,\"sink\":\"fake\"}");
        using var input = new BufferedStream(Console.OpenStandardInput());
        using var cancellation = new CancellationTokenSource();
        Task<string?> pending = ReadFrame(input, cancellation.Token);
        try
        {
            while (!receiver.Closed)
            {
                // Native receiver has its OWN timer. A stuck/abandoned pipe
                // cannot hold buttons forever or prevent session shutdown.
                if (await Task.WhenAny(pending, Task.Delay(20)) != pending) continue;
                string? raw;
                try { raw = await pending; }
                catch (IOException) { break; }
                catch (OperationCanceledException) { break; }
                if (raw is null) break;
                var result = receiver.Receive(raw);
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(new {
                    @event = "frame", result
                }));
                if (receiver.Closed) break;
                pending = ReadFrame(input, cancellation.Token);
            }
        }
        finally
        {
            receiver.Dispose(); // sends all-neutral, then releases fake sink
            cancellation.Cancel();
        }
        Console.WriteLine("{\"event\":\"stopped\"}");
        return 0;
    }
}
