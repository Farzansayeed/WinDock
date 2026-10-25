/**
 * Windows CI end-to-end simulation:
 * actual authenticated local WS -> Node hub -> separate .NET child -> FAKE reports.
 * Deliberately no driver, phone, Xbox XInput device or game.
 */
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { WebSocket } from "ws";
import { createApp } from "../server.js";
import { createConfigStore } from "../src/config.js";
import { createFakeNativeSinkFactory } from "./lib/native-gamepad-fake-bridge.mjs";

let assertions = 0;
function ok(v, reason) { assertions++; assert.ok(v, reason); }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(pred, reason, ms = 3500) {
  const deadline = Date.now() + ms;
  while (!pred() && Date.now() < deadline) await sleep(10);
  ok(pred(), reason);
}
function connect(url, headers = {}) {
  return new Promise(resolve => {
    const socket = new WebSocket(url, { headers });
    let done = false;
    const messages = [];
    socket.on("message", data => { try { messages.push(JSON.parse(String(data))); } catch {} });
    const finish = value => {
      if (!done) { done = true; resolve({ ...value, messages, socket }); }
    };
    socket.once("open", () => finish({ opened: true }));
    socket.once("unexpected-response", (_, res) => {
      res.resume();
      finish({ opened: false, status: res.statusCode });
    });
    socket.once("error", () => finish({ opened: false }));
  });
}
function frame(seq, buttons = 0x1000) {
  return JSON.stringify({ v: 1, type: "state", seq, lx: 16384, ly: 0,
    rx: 0, ry: 0, lt: 0, rt: 0, buttons });
}
const temp = await mkdtemp(join(tmpdir(), "windock-native-gamepad-"));
const records = [];
const children = [];
const lifecycle = [];
const sessions = () => records.filter(x => x.event === "ready").length;
const provider = {
  id: "fake", displayName: "Test", input: null, capture: null,
  listInstalledApps: async () => [], listRunningApps: async () => [],
};
let app;
try {
  app = await createApp({
    provider, pin: "7531", trustLoopback: false,
    configStore: createConfigStore({ path: join(temp, "config.json") }),
    gamepadSinkFactory: createFakeNativeSinkFactory({
      onEvent: x => records.push(x),
      onChild: x => children.push(x),
    }),
    // Node timeout is deliberately longer than independent native timeout.
    gamepadTimeoutMs: 700, gamepadTickMs: 20,
    gamepadHubLifecycle: event => lifecycle.push(event),
  });
  await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + app.server.address().port;
  const url = origin.replace("http:", "ws:") + "/gamepad";

  const unauth = await connect(url, { origin });
  ok(!unauth.opened && unauth.status === 401,
    "unpaired device cannot launch the native process");
  ok(children.length === 0, "no child spawned before pairing");
  const auth = await fetch(origin + "/api/auth", {
    method: "POST", headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ pin: "7531" }),
  });
  ok(auth.status === 200, "existing WinDock PIN authentication succeeded");
  const cookie = auth.headers.get("set-cookie")?.split(";")[0];
  ok(Boolean(cookie), "paired session cookie issued");
  const evil = await connect(url, { origin: "http://evil.invalid", cookie });
  ok(!evil.opened && evil.status === 401, "cross-origin cookie reuse denied");
  ok(children.length === 0, "hostile request did not spawn sidecar");

  const first = await connect(url, { origin, cookie });
  ok(first.opened, "paired same-origin owner accepted");
  await until(() => sessions() === 1, "native sidecar started for authorized owner");
  await until(() => first.messages.some(x => x.type === "ready"),
    "WebSocket ready follows real native child readiness");
  ok(children.length === 1, "one native process per owner");
  const busy = await connect(url, { origin, cookie });
  ok(!busy.opened && busy.status === 409, "second session cannot take ownership");
  ok(children.length === 1, "busy session does not spawn another child");

  first.socket.send(frame(1));
  await until(() => records.some(x => x.event === "report" && x.buttons === 0x1000),
    "authorized WebSocket frame reaches native child fake output");
  const before = records.filter(x => x.buttons === 0x1000).length;
  first.socket.send(frame(1, 0));
  await sleep(15);
  ok(records.filter(x => x.buttons === 0x1000).length === before,
    "WebSocket replay cannot change held native state");
  // Native's 180-ms independent watchdog wins before 700-ms Node watchdog.
  await until(() => records.some(x => x.event === "sink-disposed") &&
      app.gamepadHub.ownerCount === 0, "native timeout neutralizes and releases owner");
  const firstReports = records.slice(0, records.findIndex(x => x.event === "sink-disposed"));
  ok(firstReports.filter(x => x.event === "report").at(-1).buttons === 0,
    "native timeout returned A and sticks to neutral");

  const second = await connect(url, { origin, cookie });
  ok(second.opened, "new owner accepted after timed-out child");
  await until(() => sessions() === 2, "replacement native process started");
  await until(() => second.messages.some(x => x.type === "ready"),
    "replacement WebSocket waits for new native readiness");
  second.socket.send(frame(1));
  await until(() => records.filter(x => x.event === "report" && x.buttons === 0x1000).length >= 2,
    "second owner reports A through fresh native child");
  second.socket.terminate(); // abrupt client disconnect; parent must close pipe
  await until(() => records.filter(x => x.event === "sink-disposed").length === 2,
    "abrupt phone socket termination disposes native fake sink");
  ok(records.filter(x => x.event === "report").at(-1).buttons === 0,
    "disconnected WS emits final native neutral state");
  await until(() => app.gamepadHub.ownerCount === 0,
    "ownership released after child exit");

  const third = await connect(url, { origin, cookie });
  ok(third.opened, "owner can reconnect after cleanup");
  await until(() => sessions() === 3, "third fake sidecar active");
  await until(() => third.messages.some(x => x.type === "ready"),
    "third WebSocket waits for child readiness");
  third.socket.send(frame(1));
  await until(() => records.filter(x => x.event === "report" && x.buttons === 0x1000).length >= 3,
    "third session reaches native fake sink");
  children.at(-1).kill(); // synthetic abrupt native crash; no real driver exists
  await until(() => app.gamepadHub.ownerCount === 0,
    "native process failure closes and releases WebSocket owner");
  // A killed process cannot emit a final report; real driver cleanup remains
  // completely UNVERIFIED and needs independent hardware fail-neutral proof.
  ok(children.length === 3, "only authorized sequential owners spawned native children");
  await until(() => lifecycle.length === 3, "each native lab session logged one termination");
  ok(lifecycle.every(e => typeof e.reason === "string" &&
    typeof e.ready === "boolean" && Number.isInteger(e.acceptedFrames) &&
    Number.isInteger(e.activeFrames) && e.acceptedFrames >= e.activeFrames &&
    e.activeFrames >= 0 && Object.keys(e).sort().join(",") ===
      "acceptedFrames,activeFrames,ready,reason"),
    "terminal receives only fixed reason plus bounded counts");

  // Reproduce the physical v3 regression deterministically: initial native
  // neutral must NOT start its 180ms active lease before Android's first
  // authenticated whole-state frame. Delay the first frame by >180ms AFTER
  // both real native and paired WS report ready, but <1000ms startup limit.
  const previousDisposals = records.filter(x => x.event === "sink-disposed").length;
  const fourth = await connect(url, { origin, cookie });
  ok(fourth.opened, "fourth paired owner accepted for delayed-first-input regression");
  await until(() => fourth.messages.some(x => x.type === "ready"),
    "fourth ready is gated on native child neutral ACK");
  await sleep(250);
  ok(fourth.socket.readyState === WebSocket.OPEN &&
    records.filter(x => x.event === "sink-disposed").length === previousDisposals,
    "native must NOT expire 180ms after its own redundant startup neutral");
  let seq = 0;
  let keepalive;
  try {
    // Keep native and Node leases fed with genuine increasing state reports.
    const sendNext = () => {
      if (fourth.socket.readyState === WebSocket.OPEN)
        fourth.socket.send(frame(++seq, seq % 3 === 0 ? 0 : 0x1000));
    };
    sendNext();
    keepalive = setInterval(sendNext, 35);
    await until(() => records.filter(x => x.event === "report" &&
      x.buttons === 0x1000).length >= 4,
      "first post-ACK delayed input reaches real C# fake sink");
    await sleep(700);
    ok(seq >= 12 && fourth.socket.readyState === WebSocket.OPEN &&
      records.filter(x => x.event === "sink-disposed").length === previousDisposals,
      "35ms whole-state stream holds authenticated fake receiver alive beyond 700ms");
  } finally {
    clearInterval(keepalive);
  }
  // Independent unmodified native 180ms timer must still revoke the sink
  // immediately after real traffic stops. Never suppress watchdog expiry.
  await until(() => records.filter(x => x.event === "sink-disposed").length === previousDisposals + 1 &&
    app.gamepadHub.ownerCount === 0, "native still releases and neutrals without traffic");
  ok(records.filter(x => x.event === "report").at(-1).buttons === 0,
    "timeout after streaming ends on a neutral fake state");

} finally {
  if (app) {
    await app.gamepadHub.close();
    await app.hub.close();
    app.server.closeAllConnections?.();
    await new Promise(resolve => app.server.close(resolve));
  }
  await rm(temp, { recursive: true, force: true });
}
console.log(`${assertions} assertions`);
console.log("gamepad-native-bridge verification passed (fake sink, paired WS only)");
