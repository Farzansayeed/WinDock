/**
 * Bounded local-only host software timing, with a monotonic stopwatch supplied
 * by the caller. Not Wi-Fi one-way latency, XInput output or in-game response.
 * Opt-in only; no files, network, cookies, IP addresses or controller reports.
 */
export function createGamepadTimingWindow(capacity = 256) {
  if (!Number.isInteger(capacity) || capacity < 8 || capacity > 2048)
    throw new RangeError("timing window capacity must be 8..2048");
  const values = new Float64Array(capacity);
  let cursor = 0, size = 0, totalAccepted = 0, totalRejected = 0;
  return Object.freeze({
    record(sample) {
      if (!sample || sample.metric !== "host-decode-validate-sink-call" ||
        typeof sample.ms !== "number" || !Number.isFinite(sample.ms) ||
        sample.ms < 0 || sample.ms > 10000 || Object.keys(sample).length !== 2) {
        totalRejected++; return false;
      }
      values[cursor] = sample.ms;
      cursor = (cursor + 1) % capacity;
      size = Math.min(capacity, size + 1);
      totalAccepted++;
      return true;
    },
    snapshot() {
      const sorted = Array.from(values.slice(0, size)).sort((a, b) => a - b);
      const percentile = q => sorted[Math.ceil(size * q) - 1];
      return Object.freeze({
        metric: "host-decode-validate-sink-call",
        samples: size, totalAccepted, totalRejected,
        p50Ms: size ? percentile(0.5) : null,
        p95Ms: size ? percentile(0.95) : null,
        p99Ms: size ? percentile(0.99) : null,
        maxMs: size ? sorted[size - 1] : null,
      });
    },
    reset() {
      values.fill(0); cursor = 0; size = 0;
      totalAccepted = 0; totalRejected = 0;
    },
  });
}
