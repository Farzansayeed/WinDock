using WinDock.Gamepad;

static class Check
{
    internal static int Count;
    internal static void That(bool condition, string reason)
    {
        Count++;
        if (!condition) throw new Exception("Gamepad test failed: " + reason);
    }
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

        Console.WriteLine($"{Check.Count} assertions");
        Console.WriteLine("gamepad-native-state verification passed");
        return 0;
    }
}
