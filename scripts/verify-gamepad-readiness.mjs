/**
 * Lab-only async native-sink readiness / fault races.
 * Uses in-memory fake sinks; no gamepad driver, Windows hardware or real input.
 */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket } from "ws";
import { createApp } from "../server.js";
import { createConfigStore } from "../src/config.js";

let assertions = 0;
function ok(value, message) { assertions++; assert.ok(value, message); }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(predicate, message, ms = 1800) {
  const end = Date.now() + ms;
  while (!predicate() && Date.now() < end) await sleep(10);
  ok(predicate(), message);
}
const temp = await mkdtemp(join(tmpdir(), "windock-gamepad-ready-"));
const reports = [];
const closures = [];
let mode = "pending";
let permit;
const provider = {
  id: "fake", displayName: "Test", input: null, capture: null,
  listInstalledApps: async () => [], listRunningApps: async () => [],
};
const factory = () => {
  const id = mode;
  const sink = {
    write(state) { reports.push({ id, state: { ...state } }); },
    close() { closures.push(id); },
  };
  if (id === "pending" || id === "early") {
    sink.ready = new Promise(resolve => { permit = resolve; });
  } else if (id === "native-neutral") {
    // A verified native receiver independently emits initial all-neutral,
    // so the host MUST defer its first child stdin frame until phone ACK.
    sink.nativeStartupNeutral = true;
    sink.ready = new Promise(resolve => { permit = resolve; });
  } else if (id === "write-error") {
    sink.ready = Promise.reject(new Error("simulated native startup rejection"));
    sink.write = () => { throw new Error("simulated first neutral write failure"); };
  } else if (id === "rejected") {
    sink.ready = Promise.reject(new Error("simulated native startup failure"));
  } else if (id === "fault") {
    sink.onFault = callback => callback(); // synchronous crash during setup
  }
  return sink;
};
function connect(url, origin, cookie) {
  return new Promise(resolve => {
    const ws = new WebSocket(url, { headers: { origin, cookie } });
    const messages = [];
    ws.on("message", value => { try { messages.push(JSON.parse(String(value))); } catch {} });
    ws.once("open", () => resolve({ ws, messages }));
    ws.once("error", () => resolve({ ws, messages }));
  });
}
const frame = JSON.stringify({
  v: 1, type: "state", seq: 1, lx: 123, ly: 0, rx: 0, ry: 0,
  lt: 0, rt: 0, buttons: 0x1000,
});
let app;
try {
  app = await createApp({
    provider, pin: "7531", trustLoopback: false,
    configStore: createConfigStore({ path: join(temp, "config.json") }),
    gamepadSinkFactory: factory, gamepadTimeoutMs: 180, gamepadTickMs: 15,
  });
  await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + app.server.address().port;
  const url = origin.replace("http:", "ws:") + "/gamepad";
  const auth = await fetch(origin + "/api/auth", {
    method: "POST", headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({ pin: "7531" }),
  });
  ok(auth.status === 200, "existing paired session authenticates normally");
  const cookie = auth.headers.get("set-cookie")?.split(";")[0];
  ok(Boolean(cookie), "paired cookie is available");

  const first = await connect(url, origin, cookie);
  ok(first.ws.readyState === WebSocket.OPEN, "owner may connect while sink starts");
  await sleep(35);
  ok(!first.messages.some(x => x.type === "ready"), "no premature native-ready ACK");
  ok(app.gamepadHub.ownerCount === 1, "pending startup owns one session");
  permit();
  await until(() => first.messages.some(x => x.type === "ready"),
    "native readiness unlocks WS acknowledgement");
  first.ws.send(frame);
  await until(() => reports.some(x => x.id === "pending" && x.state.buttons === 0x1000),
    "frame reaches sink only after readiness");
  first.ws.terminate();
  await until(() => app.gamepadHub.ownerCount === 0 && closures.filter(x => x === "pending").length === 1,
    "disconnect neutralizes and disposes pending startup sink exactly once");
  ok(reports.filter(x => x.id === "pending").at(-1).state.buttons === 0,
    "disconnect after readiness ends neutral");

  mode = "native-neutral";
  const cert = await connect(url, origin, cookie);
  ok(cert.ws.readyState === WebSocket.OPEN, "verified native-neutral sink claims one owner");
  await sleep(30);
  ok(reports.filter(x => x.id === "native-neutral").length === 0,
    "host MUST NOT send redundant frame that starts native 180ms lease before ready");
  permit();
  await until(() => cert.messages.some(x => x.type === "ready"), "verified native neutral ACK reached phone");
  cert.ws.send(frame);
  await until(() => reports.filter(x => x.id === "native-neutral" &&
    x.state.buttons === 0x1000).length === 1,
    "first native receiver frame comes only from authenticated phone after ready");
  cert.ws.terminate();
  await until(() => app.gamepadHub.ownerCount === 0 &&
    closures.filter(x => x === "native-neutral").length === 1,
    "certified native-neutral session fails closed on disconnect");
  ok(reports.filter(x => x.id === "native-neutral").at(-1).state.buttons === 0,
    "certified receiver still gets final neutral on cleanup");

  mode = "early";
  const tooSoon = await connect(url, origin, cookie);
  ok(tooSoon.ws.readyState === WebSocket.OPEN, "pending second owner accepted");
  tooSoon.ws.send(frame); // Must NEVER reach a receiver that is not ready.
  await until(() => tooSoon.ws.readyState === WebSocket.CLOSED &&
    app.gamepadHub.ownerCount === 0 && closures.filter(x => x === "early").length === 1,
    "early client input fails closed and disposes fake sink");
  ok(!reports.some(x => x.id === "early" && x.state.buttons !== 0),
    "pre-readiness button did not reach native sink");
  permit(); // Late child ACK must never resurrect closed ownership.
  await sleep(35);
  ok(!tooSoon.messages.some(x => x.type === "ready"), "late native ACK is ignored");

  mode = "write-error";
  let unhandled = 0;
  const trackUnhandled = () => { unhandled++; };
  process.on("unhandledRejection", trackUnhandled);
  try {
    const writeFault = await connect(url, origin, cookie);
    await until(() => writeFault.ws.readyState === WebSocket.CLOSED &&
      app.gamepadHub.ownerCount === 0 && closures.filter(x => x === "write-error").length === 1,
      "failed initial neutral write disposes native sink and clears owner");
    await sleep(35);
    ok(unhandled === 0, "failed startup promise is observed even if neutral write threw");
  } finally {
    process.off("unhandledRejection", trackUnhandled);
  }

  mode = "rejected";
  const refused = await connect(url, origin, cookie);
  await until(() => refused.ws.readyState === WebSocket.CLOSED &&
    app.gamepadHub.ownerCount === 0 && closures.filter(x => x === "rejected").length === 1,
    "native startup rejection drops ownership and releases fake sink");
  ok(!refused.messages.some(x => x.type === "ready"), "failed native child never announces ready");

  mode = "fault";
  const faulted = await connect(url, origin, cookie);
  await until(() => faulted.ws.readyState === WebSocket.CLOSED &&
    app.gamepadHub.ownerCount === 0 && closures.filter(x => x === "fault").length === 1,
    "synchronous native fault during registration closes safely");
  ok(!faulted.messages.some(x => x.type === "ready"), "synchronous fault cannot announce ready");
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
console.log("gamepad-readiness verification passed (fake sink only)");
