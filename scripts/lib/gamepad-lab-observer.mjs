/**
 * Bounded, human-readable diagnostics only for the manually started C# FAKE lab.
 * No report payloads, IPs, PINs, cookies or per-frame log history retained.
 */
export function createGamepadLabObserver({ announce = () => {}, noticeLimit = 16 } = {}) {
  if (typeof announce !== "function" || !Number.isInteger(noticeLimit) ||
      noticeLimit < 0 || noticeLimit > 64)
    throw new TypeError("invalid gamepad lab observer configuration");
  const counters = {
    ready: 0, reports: 0, aPresses: 0, aReleases: 0,
    stickMoves: 0, stickCenters: 0, replays: 0, invalid: 0,
    expired: 0, sinkDisposed: 0, stopped: 0,
  };
  let aHeld = false, stickActive = false, messages = 0;
  const increment = key => { if (counters[key] < Number.MAX_SAFE_INTEGER) counters[key]++; };
  const notice = message => {
    if (messages >= noticeLimit) return;
    messages++;
    try { announce(message); } catch { /* diagnostics must not affect controller safety */ }
  };
  return Object.freeze({
    observe(event) {
      if (!event || typeof event !== "object" || Array.isArray(event)) return;
      if (event.event === "ready" && event.v === 1 && event.sink === "fake") {
        increment("ready"); notice("C# fake receiver ready (NOT an Xbox device)");
      } else if (event.event === "report") {
        if (!Number.isInteger(event.buttons) || event.buttons < 0 || event.buttons > 65535 ||
            !Number.isInteger(event.lx) || event.lx < -32768 || event.lx > 32767 ||
            !Number.isInteger(event.ly) || event.ly < -32768 || event.ly > 32767) return;
        increment("reports");
        const nextA = (event.buttons & 0x1000) !== 0;
        const nextStick = event.lx !== 0 || event.ly !== 0;
        if (nextA !== aHeld) {
          increment(nextA ? "aPresses" : "aReleases");
          notice(nextA ? "FAKE A press received" : "FAKE A release received");
        }
        if (nextStick !== stickActive) {
          increment(nextStick ? "stickMoves" : "stickCenters");
          notice(nextStick ? "FAKE left stick moved" : "FAKE left stick centered");
        }
        aHeld = nextA; stickActive = nextStick;
      } else if (event.event === "frame" && event.result === "replay") {
        increment("replays");
      } else if (event.event === "frame" && event.result === "invalid") {
        increment("invalid"); notice("FAKE receiver rejected invalid frame");
      } else if (event.event === "frame" && event.result === "expired") {
        increment("expired"); notice("FAKE receiver expired a stale frame");
      } else if (event.event === "sink-disposed") {
        increment("sinkDisposed"); notice("C# fake receiver disposed");
        aHeld = false; stickActive = false;
      } else if (event.event === "stopped") {
        increment("stopped");
      }
    },
    snapshot() { return Object.freeze({ ...counters, messages }); },
  });
}
