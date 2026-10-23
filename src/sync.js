/**
 * WebSocket state sync.
 *
 * The host owns dock state; every paired client receives a full snapshot on
 * connect and a broadcast on each change. Clients never mutate state over the
 * socket — mutations go through the authenticated HTTP API, and the resulting
 * broadcast is what updates every device. That keeps one authorization path
 * instead of two.
 */

import { WebSocketServer } from "ws";

export const HEARTBEAT_MS = 30_000;
// Poll ONLY while a paired WebSocket client is connected. External app launches
// and exits don't generate WinDock HTTP mutations, so they need their own refresh.
export const RUNNING_POLL_MS = 3_000;

/** Ignore volatile titles/handles; dock activity is keyed to app identity. */
export function runningFingerprint(state) {
  if (!Array.isArray(state?.running)) return "[]";
  return JSON.stringify(state.running.map((app) => [app?.id ?? "", app?.pid ?? 0])
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
}

export function snapshotMessage(state) {
  return JSON.stringify({ type: "snapshot", ...state });
}

/**
 * Only same-origin browsers, or native clients that send no Origin at all.
 * A browser on a hostile page always sends Origin, so this blocks cross-site
 * WebSocket hijacking of a paired session cookie.
 */
export function originAllowed(req) {
  const origin = req?.headers?.origin;
  if (!origin) return true;
  const host = req?.headers?.host;
  if (!host) return false;
  try {
    const scheme = req.socket?.encrypted ? "https:" : "http:";
    return new URL(origin).origin === new URL(`${scheme}//${host}`).origin;
  } catch {
    return false;
  }
}

/**
 * Attach a sync hub to an HTTP server.
 * @param {object} opts
 * @param {import('node:http').Server} opts.server
 * @param {(req:import('node:http').IncomingMessage)=>boolean} opts.isAuthorized
 * @param {()=>Promise<object>} opts.getState
 */
export function createSyncHub({
  server, isAuthorized, getState, heartbeatMs = HEARTBEAT_MS,
  runningPollMs = RUNNING_POLL_MS,
}) {
  const wss = new WebSocketServer({ noServer: true });
  const alive = new WeakMap();
  let lastRunning = null;
  let polling = false;
  let closing = false;

  function sendSnapshot(state) {
    const payload = snapshotMessage(state);
    lastRunning = runningFingerprint(state);
    let sent = 0;
    for (const ws of wss.clients) {
      if (ws.readyState !== ws.OPEN) continue;
      try { ws.send(payload); sent++; }
      catch { /* heartbeat later removes failed clients */ }
    }
    return sent;
  }

  async function pollRunning() {
    if (closing || polling || wss.clients.size === 0) return 0;
    polling = true;
    try {
      const state = await getState();
      const current = runningFingerprint(state);
      if (lastRunning === null) {
        lastRunning = current;
        return 0;
      }
      if (current === lastRunning) return 0;
      return sendSnapshot(state);
    } catch {
      // A failed telemetry scan is NOT evidence every app closed.
      // Preserve the last-known state and try again on the next interval.
      return 0;
    } finally {
      polling = false;
    }
  }
  const runningTimer = setInterval(() => { void pollRunning(); }, runningPollMs);
  if (typeof runningTimer.unref === "function") runningTimer.unref();

  server.on("upgrade", (req, socket, head) => {
    if (req.url?.split("?")[0] === "/input") return; // Separate bounded input channel.
    if (!originAllowed(req) || !isAuthorized(req)) {
      socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  });

  wss.on("connection", async (ws) => {
    alive.set(ws, true);
    ws.on("pong", () => alive.set(ws, true));
    ws.on("error", () => {});
    try {
      const state = await getState();
      if (lastRunning === null) lastRunning = runningFingerprint(state);
      ws.send(snapshotMessage(state));
    } catch {
      /* a client that vanished mid-handshake needs no snapshot */
    }
  });

  const timer = setInterval(() => {
    for (const ws of wss.clients) {
      if (alive.get(ws) === false) {
        ws.terminate();
        continue;
      }
      alive.set(ws, false);
      try {
        ws.ping();
      } catch {
        ws.terminate();
      }
    }
  }, heartbeatMs);
  if (typeof timer.unref === "function") timer.unref();

  return {
    wss,
    get clientCount() {
      return wss.clients.size;
    },
    async broadcast() {
      if (wss.clients.size === 0) return 0;
      return sendSnapshot(await getState());
    },
    close() {
      closing = true;
      clearInterval(timer);
      clearInterval(runningTimer);
      return new Promise((resolve) => wss.close(resolve));
    },
  };
}
