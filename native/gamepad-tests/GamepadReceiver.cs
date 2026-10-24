using System.Diagnostics;
using System.Threading;

namespace WinDock.Gamepad;

/// <summary>
/// Narrow output contract. A future APPROVED and installed Windows virtual
/// Xbox backend may implement it. This code does not load/install a driver.
/// Dispose MUST release the real virtual device on device backend failure.
/// </summary>
internal interface IControllerReportSink : IDisposable
{
    void Write(ControllerState state);
}

/// <summary>
/// Independent PC-side fail-neutral output owner. The timer is active even
/// when the phone/Node socket stops sending messages. No gamepad driver is
/// provided or implicitly installed by this class.
/// </summary>
internal sealed class ControllerReceiver : IDisposable
{
    private readonly object mutex = new();
    private readonly IControllerReportSink sink;
    private readonly StateLease lease;
    private readonly Func<long> elapsedMs;
    private readonly long startedAt;
    private readonly Timer? timer;
    private bool received;
    private bool closed;
    internal bool Closed { get { lock (mutex) return closed; } }

    internal ControllerReceiver(
        IControllerReportSink sink, Func<long>? clock = null,
        long timeoutMs = 180, int pollMs = 20, bool startTimer = true)
    {
        ArgumentNullException.ThrowIfNull(sink);
        if (timeoutMs is < 50 or > 1000 || pollMs is < 10 or > 100)
            throw new ArgumentOutOfRangeException(nameof(timeoutMs));
        this.sink = sink;
        var origin = Stopwatch.GetTimestamp();
        elapsedMs = clock ?? (() => (long)Stopwatch.GetElapsedTime(origin).TotalMilliseconds);
        startedAt = elapsedMs();
        lease = new StateLease(elapsedMs, timeoutMs);
        // The native device MUST begin neutral, not inherit a held previous
        // button/axis state from another owner or helper process.
        sink.Write(ControllerState.Neutral);
        if (startTimer)
            timer = new Timer(_ => Tick(), null, pollMs, pollMs);
    }

    internal string Receive(string raw)
    {
        lock (mutex)
        {
            if (closed) return "closed";
            // A first frame arriving after the setup grace period must not
            // resurrect a session that the periodic timer has not yet reaped.
            if (!received)
            {
                var now = elapsedMs();
                if (now < startedAt || now - startedAt > 1000)
                {
                    StopCore();
                    return "expired";
                }
            }
            var result = lease.Accept(raw);
            if (result == "ok")
            {
                received = true;
                try { sink.Write(lease.Current); }
                catch { StopCore(); return "sink-error"; }
            }
            else if (result is "invalid" or "expired" or "closed")
            {
                StopCore();
            }
            // A replay NEVER refreshes the lease nor reaches the device.
            return result;
        }
    }

    internal void Tick()
    {
        lock (mutex)
        {
            if (closed) return;
            // No first frame after handshake must also expire. The lower
            // transport can have a longer auth setup, this native sink cannot.
            var now = elapsedMs();
            if ((!received && (now < startedAt || now - startedAt > 1000)) || lease.Poll())
                StopCore();
        }
    }

    private void StopCore()
    {
        if (closed) return;
        closed = true;
        lease.Close();
        timer?.Dispose();
        // Neutral is attempted before releasing the device; even if this
        // write fails the backend Dispose MUST remove/neutralize its device.
        try { sink.Write(ControllerState.Neutral); } catch {}
        try { sink.Dispose(); } catch {}
    }

    public void Dispose()
    {
        lock (mutex) StopCore();
    }
}
