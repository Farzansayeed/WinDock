using System.Text;
using System.Text.Json;

namespace WinDock.Gamepad;

/// <summary>
/// Device-agnostic v1 full-state snapshots, not a device driver.
/// Keep field names/ranges aligned with src/gamepad/protocol.js.
/// Transport authentication and session ownership must be checked separately.
/// </summary>
internal readonly record struct ControllerState(
    int Sequence, short LX, short LY, short RX, short RY,
    byte LT, byte RT, ushort Buttons)
{
    internal const int MaxFrameBytes = 256;
    internal const int MaxSequence = 0x7fffffff;
    internal const int AllowedButtons = 0xf3ff;

    internal static readonly ControllerState Neutral = new(0, 0, 0, 0, 0, 0, 0, 0);

    internal static bool TryParse(string? raw, out ControllerState frame)
    {
        frame = Neutral;
        if (raw is null || Encoding.UTF8.GetByteCount(raw) is <= 0 or > MaxFrameBytes) return false;

        try
        {
            using var json = JsonDocument.Parse(raw);
            var root = json.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return false;

            // Reject omitted, duplicate and unknown properties. The Android and
            // Node protocols are strict: later protocol revisions must handshake.
            var seen = new HashSet<string>(StringComparer.Ordinal);
            foreach (var item in root.EnumerateObject())
            {
                if (!seen.Add(item.Name) ||
                    item.Name is not ("v" or "type" or "seq" or "lx" or "ly" or "rx"
                        or "ry" or "lt" or "rt" or "buttons"))
                    return false;
            }
            if (seen.Count != 10) return false;
            if (!GetInteger(root, "v", out int version) || version != 1 ||
                !root.TryGetProperty("type", out var type) || type.ValueKind != JsonValueKind.String ||
                type.GetString() != "state" ||
                !GetInteger(root, "seq", out int sequence) || sequence is < 1 or > MaxSequence ||
                !GetInteger(root, "lx", out int lx) || lx is < -32768 or > 32767 ||
                !GetInteger(root, "ly", out int ly) || ly is < -32768 or > 32767 ||
                !GetInteger(root, "rx", out int rx) || rx is < -32768 or > 32767 ||
                !GetInteger(root, "ry", out int ry) || ry is < -32768 or > 32767 ||
                !GetInteger(root, "lt", out int lt) || lt is < 0 or > 255 ||
                !GetInteger(root, "rt", out int rt) || rt is < 0 or > 255 ||
                !GetInteger(root, "buttons", out int buttons) || buttons < 0 ||
                (buttons & ~AllowedButtons) != 0)
                return false;

            frame = new ControllerState(sequence, (short)lx, (short)ly, (short)rx,
                (short)ry, (byte)lt, (byte)rt, (ushort)buttons);
            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool GetInteger(JsonElement root, string name, out int value)
    {
        value = 0;
        return root.TryGetProperty(name, out var entry) &&
            entry.ValueKind == JsonValueKind.Number && entry.TryGetInt32(out value);
    }
}

/// <summary>
/// Single-authorized-session model for Windows-side neutral fail-safe.
/// This class alone doesn't create a controller or own an authenticated socket.
/// A future native helper must call Poll on a timer and dispose the device.
/// </summary>
internal sealed class StateLease(Func<long> nowMilliseconds, long timeoutMilliseconds = 180)
{
    private int sequence;
    private long? lastAt;
    internal ControllerState Current { get; private set; } = ControllerState.Neutral;
    internal bool Closed { get; private set; }

    internal string Accept(string json)
    {
        if (Closed) return "closed";
        long tick = nowMilliseconds();
        if (lastAt.HasValue && tick - lastAt.Value > timeoutMilliseconds)
        {
            Close(); return "expired";
        }
        if (!ControllerState.TryParse(json, out var state))
        {
            Close(); return "invalid";
        }
        if (state.Sequence <= sequence) return "replay";
        sequence = state.Sequence;
        lastAt = tick;
        Current = state;
        return "ok";
    }

    internal bool Poll()
    {
        if (!Closed && lastAt.HasValue &&
            nowMilliseconds() - lastAt.Value > timeoutMilliseconds) Close();
        return Closed;
    }

    internal void Close()
    {
        Closed = true;
        Current = ControllerState.Neutral;
    }
}
