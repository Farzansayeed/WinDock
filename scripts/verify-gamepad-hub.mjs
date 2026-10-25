/**
 * Real WebSocket + HTTP authentication/lease test with an injectable
 * IN-MEMORY sink. This test does NOT make an Xbox device or ship a driver.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket } from "ws";
import { createChecker } from "./lib/assert.mjs";
import { createApp } from "../server.js";
import { createConfigStore } from "../src/config.js";
import { gamepadStartupExpired } from "../src/gamepad/hub.js";
import { GAMEPAD_BUTTON, neutralGamepadState } from "../src/gamepad/protocol.js";

const t = createChecker("gamepad-hub");
const PIN = "7351";
// First-input deadline is checked on arrival, even if its watchdog stalls.
t.ok(!gamepadStartupExpired(0, 0), "fresh owner permitted");
t.ok(!gamepadStartupExpired(0, 1000), "1000ms boundary permitted");
t.ok(gamepadStartupExpired(0, 1001), "late first input rejected");
t.ok(gamepadStartupExpired(10, 9), "startup clock rollback rejected");
t.ok(gamepadStartupExpired(0, Infinity), "nonfinite receipt time rejected");
t.ok(gamepadStartupExpired(NaN, 0), "nonfinite start time rejected");
const temp = await mkdtemp(join(tmpdir(), "windock-gamepad-hub-"));
const snapshots = [];
let closes = 0;
const sinkFactory = () => ({
  write(state) { snapshots.push({ ...state }); },
  close() { closes++; },
});
const provider = {
  id: "fake", displayName: "Test", input: null, capture: null,
  listInstalledApps: async () => [], listRunningApps: async () => [],
};
function wsOpen(url, options = {}) {
  return new Promise((resolve) => {
    const socket = new WebSocket(url, options);
    const messages = [];
    socket.on("message", (msg) => messages.push(JSON.parse(String(msg))));
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      resolve({ ...result, messages, socket });
    };
    socket.once("open", () => finish({ opened: true }));
    socket.once("unexpected-response", (req, res) => {
      res.resume();
      finish({ opened: false, status: res.statusCode });
    });
    socket.once("error", () => finish({ opened: false }));
  });
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(pred, reason, ms = 1500) {
  const end = Date.now() + ms;
  while (!pred() && Date.now() < end) await sleep(10);
  t.ok(pred(), reason);
}
const frame = (seq, buttons = GAMEPAD_BUTTON.a) => JSON.stringify({
  v: 1, type: "state", seq, lx: 12000, ly: -2000, rx: 0, ry: 0,
  lt: 0, rt: 0, buttons,
});
let app;
try {
  app = await createApp({
    provider,
    configStore: createConfigStore({ path: join(temp, "config.json") }),
    pin: PIN, trustLoopback: false,
    gamepadSinkFactory: sinkFactory, gamepadTimeoutMs: 100,
    gamepadTickMs: 15,
  });
  await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
  const url = "ws://127.0.0.1:" + app.server.address().port + "/gamepad";
  const origin = "http://127.0.0.1:" + app.server.address().port;
  const denied = await wsOpen(url);
  t.equal(denied.status, 401, "unpaired gamepad socket is rejected");
  t.equal(app.gamepadHub.ownerCount, 0, "rejected socket cannot take ownership");
  const auth = await fetch(origin + "/api/auth", {
    method: "POST", headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ pin: PIN }),
  });
  t.equal(auth.status, 200, "pairing uses existing WinDock PIN");
  const cookie = auth.headers.get("set-cookie").split(";")[0];

  const originDenied = await wsOpen(url, { headers: { cookie, origin: "http://evil.invalid" } });
  t.equal(originDenied.status, 401, "paired cookie on hostile origin cannot open gamepad");
  const first = await wsOpen(url, { headers: { cookie, origin } });
  t.ok(first.opened, "paired same-origin websocket accepted");
  await until(() => first.messages.some(m => m.type === "ready"), "ready ack");
  t.equal(app.gamepadHub.ownerCount, 1, "one paired device owns channel");

  const busy = await wsOpen(url, { headers: { cookie, origin } });
  t.equal(busy.status, 409, "second paired device cannot steal controller");

  first.socket.send(frame(1));
  await until(() => snapshots.some(x => x.buttons === GAMEPAD_BUTTON.a),
    "valid full state reaches in-memory sink");
  const beforeReplay = snapshots.length;
  first.socket.send(frame(1, 0));
  await sleep(18);
  t.equal(snapshots.length, beforeReplay, "replayed snapshot ignored, not sent");
  // Timer MUST neutrally close even if no further frames arrive.
  await until(() => closes >= 1 && app.gamepadHub.ownerCount === 0,
    "lease expires without traffic and releases sink");
  t.deepEqual(snapshots.at(-1), neutralGamepadState(),
    "watchdog releases both sticks, analog triggers and buttons");

  const replacement = await wsOpen(url, { headers: { cookie, origin } });
  t.ok(replacement.opened, "fresh owner allowed after prior sink closed");
  replacement.socket.send(frame(1, GAMEPAD_BUTTON.lb));
  await until(() => snapshots.some(x => x.buttons === GAMEPAD_BUTTON.lb),
    "new session can start at sequence one");
  replacement.socket.send(frame(2, GAMEPAD_BUTTON.a));
  await until(() => snapshots.at(-1).buttons === GAMEPAD_BUTTON.a,
    "newer sequence accepted");
  let invalidCloseReason = null;
  replacement.socket.on("close", (code, reason) => {
    invalidCloseReason = code === 1008 ? String(reason) : "unexpected-code";
  });
  replacement.socket.send('{"unexpected":"frame"}');
  await until(() => closes >= 2, "invalid whole-state frame ends session");
  await until(() => invalidCloseReason !== null, "invalid close reason delivered to owner");
  t.equal(invalidCloseReason, "frame-invalid", "paired phone sees a bounded server-owned validator reason");
  t.deepEqual(snapshots.at(-1), neutralGamepadState(), "malformed input fails neutral");

  const next = await wsOpen(url, { headers: { cookie, origin } });
  t.ok(next.opened, "disconnect has released owner");
  next.socket.send(frame(1));
  await until(() => snapshots.at(-1).buttons === GAMEPAD_BUTTON.a, "third owner can report");
  next.socket.terminate();
  await until(() => closes >= 3, "abrupt phone disconnect closes sink");
  t.deepEqual(snapshots.at(-1), neutralGamepadState(), "abrupt disconnect neutralizes");

  const disabled = await createApp({
    provider, configStore: createConfigStore({ path: join(temp, "off.json") }),
    pin: PIN, trustLoopback: true,
  });
  await new Promise(resolve => disabled.server.listen(0, "127.0.0.1", resolve));
  try {
    const unavailable = await wsOpen("ws://127.0.0.1:" + disabled.server.address().port + "/gamepad");
    t.equal(unavailable.status, 503, "production without driver sink refuses gamepad");
    t.equal(disabled.gamepadHub.enabled, false, "gamepad never silently emulates keyboard");
  } finally {
    await disabled.gamepadHub.close();
    await disabled.hub.close();
    disabled.server.closeAllConnections?.();
    await new Promise(resolve => disabled.server.close(resolve));
  }
} finally {
  if (app) {
    await app.gamepadHub.close();
    await app.hub.close();
    app.server.closeAllConnections?.();
    await new Promise(resolve => app.server.close(resolve));
  }
  await rm(temp, { recursive: true, force: true });
}
t.done("gamepad-hub verification passed");
