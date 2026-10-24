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
function deny(socket, code, message) {
  socket.end("HTTP/1.1 " + code + " " + message + "\r\nConnection: close\r\n\r\n");
}

export function createGamepadHub({
  server, isAuthorized, sinkFactory = null, timeoutMs = 180,
  tickMs = 30, now = () => performance.now(),
} = {}) {
  if (!server || typeof isAuthorized !== "function" ||
      !Number.isInteger(tickMs) || tickMs < 10 || tickMs > 100 ||
      !Number.isInteger(timeoutMs) || timeoutMs < 50 || timeoutMs > 1000 ||
      typeof now !== "function")
    throw new TypeError("invalid gamepad channel configuration");

  const wss = new WebSocketServer({
    noServer: true, maxPayload: GAMEPAD_MAX_BYTES,
    perMessageDeflate: false,
  });
  let owner = null;
  let shuttingDown = false;
  const closeWork = new Set();

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.split("?")[0] !== "/gamepad") return;
    if (shuttingDown || typeof sinkFactory !== "function") {
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
      try { close = sink?.close?.(); } catch {}
      const work = Promise.resolve(close).catch(() => {}).finally(() => {
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
    } catch {
      cleanup(1011); return;
    }

    timer = setInterval(() => {
      if (disposed) return;
      // Authorization is NOT a once-only gate. Revoked cookies end ownership.
      if (!isAuthorized(req) || !Number.isFinite(now()) ||
          (gate.poll().closed) || (startedAt !== null && now() - startedAt > 1000
            && count === 0)) {
        cleanup(1008);
      }
    }, tickMs);
    timer.unref?.();
    ws.on("close", () => cleanup());
    ws.on("error", () => cleanup(1011));
    ws.on("message", (payload, isBinary) => {
      if (disposed) return;
      const time = now();
      if (time - rateStart >= 1000) { rateStart = time; count = 0; }
      if (!isAuthorized(req) || isBinary || ++count > 180 ||
          payload.length > GAMEPAD_MAX_BYTES) {
        cleanup(1008); return;
      }
      const state = decodeGamepadState(payload);
      const verdict = gate.accept(state);
      if (verdict.reason === "replay") return; // replay NEVER extends lease
      if (!verdict.accepted) { cleanup(1008); return; }
      startedAt = null;
      try { sink.write(verdict.state); }
      catch { cleanup(1011); }
    });
    send({ type: "ready", v: 1 });
  });

  return {
    get enabled() { return typeof sinkFactory === "function"; },
    get ownerCount() { return owner === null ? 0 : 1; },
    async close() {
      shuttingDown = true;
      for (const ws of wss.clients) ws.terminate();
      await new Promise((resolve) => wss.close(resolve));
      await Promise.all([...closeWork]);
    },
  };
}
