/**
 * Driver-neutral, authenticated gamepad control channel.
 *
 * SECURITY/PROVENANCE: disabled in production until a real, supported Windows
 * native controller backend supplies sinkFactory. No WebSocket client can create
 * an Xbox controller or emit keyboard events from this module alone.
 *
 * Unlike /input (mouse), this /gamepad socket has one explicit owner, bounded
 * whole-state frames, monotonically increasing sequence numbers and a short
 * timer-driven fail-neutral lease. It never trusts client-provided ownership.
 */
import { WebSocketServer } from "ws";
import { originAllowed } from "../sync.js";
import {
  GAMEPAD_MAX_BYTES, decodeGamepadState, createGamepadStateGate,
  neutralGamepadState,
} from "./protocol.js";

const REPLY_LIMIT = 256;

// Enforce the first-frame deadline on arrival, not only on watchdog timers.
export function gamepadStartupExpired(start, time) {
  return !Number.isFinite(start) || !Number.isFinite(time) ||
    time < start || time - start > 1000;
}
function deny(socket, code, message) {
  socket.end("HTTP/1.1 " + code + " " + message + "\r\nConnection: close\r\n\r\n");
}

export function createGamepadHub({
  server, isAuthorized, sinkFactory = null, timeoutMs = 180,
  tickMs = 30, now = () => performance.now(), onTiming = null,
} = {}) {
  if (!server || typeof isAuthorized !== "function" ||
      !Number.isInteger(tickMs) || tickMs < 10 || tickMs > 100 ||
      !Number.isInteger(timeoutMs) || timeoutMs < 50 || timeoutMs > 1000 ||
      typeof now !== "function" ||
      (onTiming !== null && typeof onTiming !== "function"))
    throw new TypeError("invalid gamepad channel configuration");

  const wss = new WebSocketServer({
    noServer: true, maxPayload: GAMEPAD_MAX_BYTES,
    perMessageDeflate: false,
  });
  let owner = null;
  let shuttingDown = false;
  // Teardown errors mean we cannot prove the previous native device was
  // released. Never grant a second controller session in this process.
  let quarantined = false;
  const closeWork = new Set();

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.split("?")[0] !== "/gamepad") return;
    if (shuttingDown || quarantined || typeof sinkFactory !== "function") {
      deny(socket, 503, "Service Unavailable"); return;
    }
    if (!originAllowed(req) || !isAuthorized(req)) {
      deny(socket, 401, "Unauthorized"); return;
    }
    if (owner !== null) {
      deny(socket, 409, "Conflict"); return;
    }
    wss.handleUpgrade(req, socket, head,
      (ws) => wss.emit("connection", ws, req));
  });

  wss.on("connection", (ws, req) => {
    ws.on("error", () => {});
    if (owner !== null || shuttingDown) { ws.close(1008); return; }
    // Claim ownership BEFORE opening sink. No other client may race setup.
    owner = ws;
    let sink;
    let gate;
    let disposed = false;
    let startedAt = now();
    let nativeReady;
    let sinkReady = false;
    let rateStart = startedAt;
    let count = 0;
    let timer;
    const send = (value) => {
      if (ws.readyState === ws.OPEN) {
        const json = JSON.stringify(value);
        if (Buffer.byteLength(json) <= REPLY_LIMIT) ws.send(json);
      }
    };
    function cleanup(code = 1000) {
      if (disposed) return;
      disposed = true;
      clearInterval(timer);
      gate?.close();
      // In real backend the sink MUST submit a neutral state synchronously
      // or throw and independently tear down its actual virtual device.
      try { sink?.write({ ...neutralGamepadState() }); } catch {}
      let close;
      // A partially initialized sink without a close method cannot prove
      // release of a potentially allocated native device. Quarantine it.
      if (sink && typeof sink.close !== "function") quarantined = true;
      try { close = sink?.close?.(); }
      catch { quarantined = true; }
      const work = Promise.resolve(close).catch(() => {
        // Never silently swallow failed native-device teardown and then
        // admit a fresh owner. Subsequent upgrades return HTTP 503 until
        // the process restarts after investigation.
        quarantined = true;
      }).finally(() => {
        closeWork.delete(work);
        if (owner === ws) owner = null;
      });
      closeWork.add(work);
      if (ws.readyState === ws.OPEN) ws.close(code);
      else if (ws.readyState === ws.CONNECTING) ws.terminate();
    }
    try {
      sink = sinkFactory();
      if (!sink || typeof sink.write !== "function" || typeof sink.close !== "function")
        throw new TypeError("missing native gamepad report sink");
      // Observe any ready-promise rejection BEFORE invoking a sink write or
      // hook that may synchronously fail. Otherwise cleanup could abandon a
      // rejected native startup promise and crash Node via unhandledRejection.
      nativeReady = sink.ready;
      if (nativeReady !== undefined) {
        if (!nativeReady || typeof nativeReady.then !== "function")
          throw new TypeError("invalid native sink readiness promise");
        nativeReady = Promise.resolve(nativeReady);
        void nativeReady.catch(() => {}); // retains rejection for .then below
      }
      gate = createGamepadStateGate({ timeoutMs, now });
      sink.write({ ...neutralGamepadState() });
      // Optional native child-liveness hook. A crashed/stopped native sink
      // cannot keep ownership of /gamepad even if Node's socket stays open.
      // Existing synchronous in-memory test sinks remain valid.
      if (sink.onFault !== undefined) {
        if (typeof sink.onFault !== "function")
          throw new TypeError("invalid native sink failure hook");
        sink.onFault(() => cleanup(1011));
      }
      // An optional readiness promise must reflect the CHILD receiver's own
      // startup ACK; process.spawn and an open stdin pipe are not device readiness.
    } catch {
      cleanup(1011); return;
    }
    // A synchronous onFault callback may already have closed this owner.
    if (disposed) return;

    timer = setInterval(() => {
      if (disposed) return;
      // Authorization is NOT a once-only gate. Revoked cookies end ownership.
      const time = now();
      if (!isAuthorized(req) || !Number.isFinite(time) ||
          (startedAt !== null && gamepadStartupExpired(startedAt, time)) ||
          gate.poll().closed) {
        cleanup(1008);
      }
    }, tickMs);
    timer.unref?.();
    ws.on("close", () => cleanup());
    ws.on("error", () => cleanup(1011));
    ws.on("message", (payload, isBinary) => {
      if (disposed) return;
      // No input can be delivered to a not-yet-initialized native receiver.
      // The client must wait for the WS ready ACK after native readiness.
      if (!sinkReady) { cleanup(1008); return; }
      const time = now();
      // A delayed timer callback must not admit an expired first input.
      if (!isAuthorized(req) || !Number.isFinite(time) ||
          (startedAt !== null && gamepadStartupExpired(startedAt, time))) {
        cleanup(1008); return;
      }
      if (time - rateStart >= 1000) { rateStart = time; count = 0; }
      if (isBinary || ++count > 180 || payload.length > GAMEPAD_MAX_BYTES) {
        cleanup(1008); return;
      }
      // Optional local-only, monotonic host software processing metric.
      // It cannot reveal client frames/cookies or assert one-way Wi-Fi delay.
      const timingStart = onTiming ? now() : null;
      const state = decodeGamepadState(payload);
      const verdict = gate.accept(state);
      if (verdict.reason === "replay") return; // replay NEVER extends lease
      if (!verdict.accepted) { cleanup(1008); return; }
      startedAt = null;
      try {
        sink.write(verdict.state);
        if (timingStart !== null) {
          const elapsed = now() - timingStart;
          if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed <= 10000) {
            try { onTiming({ metric: "host-decode-validate-sink-call", ms: elapsed }); }
            catch { /* diagnostics must never change controller safety */ }
          }
        }
      } catch { cleanup(1011); }
    });
    const announceReady = () => {
      if (disposed) return; // late readiness after disconnect/fault is inert
      // Check the deadline here too: a stalled event loop cannot resurrect
      // an expired native-startup lease via a late promise resolution.
      if (!isAuthorized(req) || gamepadStartupExpired(startedAt, now())) {
        cleanup(1008); return;
      }
      sinkReady = true;
      send({ type: "ready", v: 1 });
    };
    if (nativeReady === undefined) announceReady();
    else Promise.resolve(nativeReady).then(announceReady, () => cleanup(1011));
  });

  return {
    get enabled() { return typeof sinkFactory === "function"; },
    get quarantined() { return quarantined; },
    get ownerCount() { return owner === null ? 0 : 1; },
    async close() {
      shuttingDown = true;
      for (const ws of wss.clients) ws.terminate();
      await new Promise((resolve) => wss.close(resolve));
      await Promise.all([...closeWork]);
    },
  };
}
