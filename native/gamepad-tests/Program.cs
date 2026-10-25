using WinDock.Gamepad;
using System.Threading;

static class Check
{
    internal static int Count;
    internal static void That(bool condition, string reason)
    {
        Count++;
        if (!condition) throw new Exception("Gamepad test failed: " + reason);
    }
}
internal sealed class FakeController : IControllerReportSink
{
    internal List<ControllerState> Reports { get; } = new();
    internal int DisposeCount;
    public void Write(ControllerState state) { lock (Reports) Reports.Add(state); }
    public void Dispose() => Interlocked.Increment(ref DisposeCount);
}

internal sealed class RejectInitialNeutralSink : IControllerReportSink
{
    internal int DisposeCount;
    public void Write(ControllerState state) => throw new IOException("fake initial neutral failure");
    public void Dispose() => Interlocked.Increment(ref DisposeCount);
}

internal static class Program
{
    private const string Valid =
        "{\"v\":1,\"type\":\"state\",\"seq\":1,\"lx\":-32768,\"ly\":32767,\"rx\":0,\"ry\":120,\"lt\":0,\"rt\":255,\"buttons\":4352}";

    private static int Main()
    {
        Check.That(ControllerState.TryParse(Valid, out var initial), "valid XInput frame");
        Check.That(initial.LX == short.MinValue, "signed left stick min");
        Check.That(initial.LY == short.MaxValue, "signed left stick max");
        Check.That(initial.Buttons == (0x1000 | 0x0100), "A+LB bitmask");
        Check.That(initial.RT == 255 && initial.LT == 0, "analog trigger bounds");

        string Invalid(string target, string substitute) => Valid.Replace(target, substitute, StringComparison.Ordinal);
        foreach (var pair in new (string Old, string New)[] {
            ("\"v\":1", "\"v\":2"),
            ("\"seq\":1", "\"seq\":0"),
            ("\"seq\":1", "\"seq\":2147483648"),
            ("\"lx\":-32768", "\"lx\":-32769"),
            ("\"ly\":32767", "\"ly\":32768"),
            ("\"ry\":120", "\"ry\":1.5"),
            ("\"lt\":0", "\"lt\":-1"),
            ("\"rt\":255", "\"rt\":256"),
            ("\"buttons\":4352", "\"buttons\":1024"),
            ("\"buttons\":4352", "\"buttons\":65536"),
            ("\"lx\":-32768", "\"lx\":\"-32768\""),
            ("\"type\":\"state\"", "\"type\":\"release\""),
            ("\"seq\":1,", ""),
        }) {
            Check.That(!ControllerState.TryParse(Invalid(pair.Old, pair.New), out _), "reject " + pair.New);
        }
        Check.That(!ControllerState.TryParse(Valid.Replace("\"v\":1", "\"v\":1,\"v\":1"), out _),
            "duplicate keys rejected");
        Check.That(!ControllerState.TryParse(Valid.Replace("\"v\":1", "\"v\":1,\"command\":\"execute\""), out _),
            "unknown fields rejected");
        Check.That(!ControllerState.TryParse(new string(' ', 257), out _), "oversized frame rejected");
        Check.That(!ControllerState.TryParse("{", out _), "malformed JSON rejected");

        long clock = 0;
        var lease = new StateLease(() => clock);
        Check.That(lease.Accept(Valid) == "ok", "first state accepted");
        Check.That(lease.Current.Buttons == 4352, "buttons are held until neutralized");
        clock = 70;
        Check.That(lease.Accept(Valid) == "replay", "same seq rejected");
        clock = 181;
        Check.That(lease.Poll(), "replay does not refresh timeout");
        Check.That(lease.Current == ControllerState.Neutral, "timeout resets all values");
        Check.That(lease.Accept(Valid.Replace("\"seq\":1", "\"seq\":2")) == "closed",
            "timeout session cannot silently resume");

        clock = 0;
        var invalidLease = new StateLease(() => clock);
        Check.That(invalidLease.Accept(Valid) == "ok", "second fresh session");
        Check.That(invalidLease.Accept("{}") == "invalid", "malformed input closes session");
        Check.That(invalidLease.Current == ControllerState.Neutral, "invalid releases all buttons");
        var closed = new StateLease(() => clock);
        Check.That(closed.Accept(Valid) == "ok", "third session");
        closed.Close();
        Check.That(closed.Current == ControllerState.Neutral, "explicit stop releases controls");

        // Monotonic freshness is a safety invariant independent of the OS
        // driver: replay and clock rollback must never extend a held button.
        clock = 100;
        var backwardsAccept = new StateLease(() => clock);
        Check.That(backwardsAccept.Accept(Valid) == "ok", "rollback test holds initial frame");
        clock = 99;
        Check.That(backwardsAccept.Accept(Valid.Replace("\"seq\":1", "\"seq\":2")) == "expired",
            "clock rollback on receive closes the lease");
        Check.That(backwardsAccept.Current == ControllerState.Neutral,
            "clock rollback on receive resets all controls");
        clock = 100;
        var backwardsPoll = new StateLease(() => clock);
        Check.That(backwardsPoll.Accept(Valid) == "ok", "poll rollback test holds initial frame");
        clock = 99;
        Check.That(backwardsPoll.Poll() && backwardsPoll.Current == ControllerState.Neutral,
            "clock rollback on independent watchdog poll resets controls");

        // Fail closed even if a future approved backend cannot accept its
        // very first neutral report. Constructor failure must release device.
        var rejectInitial = new RejectInitialNeutralSink();
        bool rejected = false;
        try { using var unused = new ControllerReceiver(rejectInitial, startTimer: false); }
        catch (IOException) { rejected = true; }
        Check.That(rejected, "initial native neutral-write failure propagates");
        Check.That(rejectInitial.DisposeCount == 1,
            "initial neutral-write failure disposes native device once");

        // Native-side device-independent report owner with an INDEPENDENT
        // timer and neutral output. No virtual Xbox driver is installed.
        long receiverClock = 0;
        var fake = new FakeController();
        using (var receiver = new ControllerReceiver(fake, () => receiverClock,
            timeoutMs: 180, pollMs: 20, startTimer: false))
        {
            Check.That(fake.Reports.Count == 1 && fake.Reports[0] == ControllerState.Neutral,
                "new native device starts neutral");
            Check.That(receiver.Receive(Valid) == "ok", "valid native input reaches sink");
            Check.That(fake.Reports[^1].Buttons == 4352, "native sink holds intended A and LB");
            receiverClock = 80;
            Check.That(receiver.Receive(Valid) == "replay", "replay ignored at native output");
            Check.That(fake.Reports.Count == 2, "replay cannot hit physical sink");
            receiverClock = 181;
            receiver.Tick();
            Check.That(receiver.Closed, "independent watchdog expires state on Tick");
            Check.That(fake.Reports[^1] == ControllerState.Neutral, "watchdog sends neutral");
            Check.That(fake.DisposeCount == 1, "watchdog disposes virtual device exactly once");
            Check.That(receiver.Receive(Valid.Replace("\"seq\":1", "\"seq\":2")) == "closed",
                "old session cannot revive after PC-side watchdog");
        }
        Check.That(fake.DisposeCount == 1, "native stop/dispose idempotent");

        var wrong = new FakeController();
        using (var receiver = new ControllerReceiver(wrong, () => 0,
            timeoutMs: 180, startTimer: false))
        {
            Check.That(receiver.Receive(Valid) == "ok", "second PC session active");
            Check.That(receiver.Receive("{}") == "invalid", "invalid report stops native session");
            Check.That(wrong.Reports[^1] == ControllerState.Neutral,
                "invalid report neutralizes native sink");
        }
        var abandoned = new FakeController();
        receiverClock = 0;
        using (var receiver = new ControllerReceiver(abandoned, () => receiverClock,
            timeoutMs: 180, startTimer: false))
        {
            receiverClock = 1001;
            receiver.Tick();
            Check.That(receiver.Closed, "session that never sent a first frame expires");
            Check.That(abandoned.DisposeCount == 1, "idle session disposes sink");
        }
        var late = new FakeController();
        receiverClock = 0;
        using (var receiver = new ControllerReceiver(late, () => receiverClock,
            timeoutMs: 180, startTimer: false))
        {
            receiverClock = 1001;
            Check.That(receiver.Receive(Valid) == "expired",
                "late first report cannot beat a delayed watchdog tick");
            Check.That(receiver.Closed && late.Reports[^1] == ControllerState.Neutral,
                "late first report closes and neutralizes the native sink");
            Check.That(late.DisposeCount == 1, "late first report disposes sink once");
        }
        var regressedBeforeFirst = new FakeController();
        receiverClock = 100;
        using (var receiver = new ControllerReceiver(regressedBeforeFirst,
            () => receiverClock, timeoutMs: 180, startTimer: false))
        {
            receiverClock = 99;
            receiver.Tick();
            Check.That(receiver.Closed && regressedBeforeFirst.Reports[^1] == ControllerState.Neutral,
                "native watchdog stops a backwards clock before the first frame");
            Check.That(regressedBeforeFirst.DisposeCount == 1,
                "pre-first-frame clock rollback disposes fake sink");
        }

        // Inject clock faults without a driver. Both the inbound receiver
        // and independent native watchdog must fail neutral and dispose once.
        int receiveCalls = 0;
        var receiveClockSink = new FakeController();
        using (var receiver = new ControllerReceiver(receiveClockSink,
            () => ++receiveCalls == 1 ? 0 : throw new InvalidOperationException("clock failed"),
            startTimer: false))
        {
            Check.That(receiver.Receive(Valid) == "clock-error",
                "receive fails closed on first-frame clock exception");
            Check.That(receiver.Closed && receiveClockSink.Reports[^1] == ControllerState.Neutral,
                "receive clock fault emits neutral");
            Check.That(receiveClockSink.DisposeCount == 1,
                "receive clock fault disposes fake sink once");
        }
        int timerCalls = 0;
        var timerClockSink = new FakeController();
        using (var receiver = new ControllerReceiver(timerClockSink,
            () => ++timerCalls == 1 ? 0 : throw new InvalidOperationException("timer clock failed"),
            startTimer: false))
        {
            receiver.Tick();
            Check.That(receiver.Closed && timerClockSink.Reports[^1] == ControllerState.Neutral,
                "watchdog clock fault emits neutral");
            Check.That(timerClockSink.DisposeCount == 1,
                "watchdog clock fault disposes fake sink once");
        }

        // Live timer proof: expiry occurs WITHOUT a Tick call or additional
        // websocket/frame traffic. Timed fake sink, no driver/admin action.
        var timed = new FakeController();
        using (var receiver = new ControllerReceiver(timed, timeoutMs: 60, pollMs: 15))
        {
            Check.That(receiver.Receive(Valid) == "ok", "real timer test presses A");
            Check.That(SpinWait.SpinUntil(() => receiver.Closed, 1500),
                "independent native timer expires held input with no extra frames");
            lock (timed.Reports)
                Check.That(timed.Reports[^1] == ControllerState.Neutral,
                    "real timer resets all native buttons/sticks/triggers");
            Check.That(timed.DisposeCount == 1, "real native timer disposes fake device");
        }

        Console.WriteLine($"{Check.Count} assertions");
        Console.WriteLine("gamepad-native-state verification passed");
        return 0;
    }
}
