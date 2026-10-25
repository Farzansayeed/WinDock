/**
 * Pure Node simulated-child IPC lifecycle test (no dotnet, driver or device).
 * The production /gamepad endpoint is never involved or enabled.
 */
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { createFakeNativeSinkFactory } from "./lib/native-gamepad-fake-bridge.mjs";

let checks = 0;
function ok(test, why) { checks++; assert.ok(test, why); }
const tick = () => new Promise(resolve => setImmediate(resolve));
const NEUTRAL = { event: "report", seq: 0, buttons: 0, lx: 0, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0 };
class SimulatedChild extends EventEmitter {
  stdin = new PassThrough();
  stdout = new PassThrough();
  stderr = new PassThrough();
  killed = false;
  exitCode = null;
  kills = 0;
  kill() {
    if (this.killed) return false;
    this.killed = true;
    this.kills++;
    queueMicrotask(() => this.finish(null));
    return true;
  }
  finish(code = 0) {
    if (this.exitCode !== null || this.finished) return;
    this.finished = true;
    this.exitCode = code;
    this.emit("close", code);
  }
  emitJson(value) { this.stdout.write(JSON.stringify(value) + "\n"); }
}
function setup() {
  const child = new SimulatedChild();
  const events = [];
  let faults = 0;
  const sink = createFakeNativeSinkFactory({
    launchChild: () => child,
    onEvent: event => events.push(event),
  })();
  // Attach a rejection handler *before* any simulated child startup fault.
  const settled = sink.ready.then(() => "ready", () => "rejected");
  sink.onFault(() => { faults++; });
  return { child, events, sink, settled, get faults() { return faults; } };
}
function greet(child) { child.emitJson(NEUTRAL); child.emitJson({ event: "ready", v: 1, sink: "fake" }); }

{
  const s = setup();
  greet(s.child);
  ok(await s.settled === "ready", "only neutral initialized fake child becomes ready");
  ok(s.sink.nativeStartupNeutral === true,
    "verified native child's initial neutral is explicitly owned before ready ACK");
  ok(s.events.length === 2 && s.events[0].seq === 0, "neutral emitted before native readiness");
  s.sink.write({ lx: 42, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0, buttons: 0x1000 });
  ok(s.child.stdin.readableLength > 0, "authorized test frame went to private stdio pipe");
  s.child.emitJson({ event: "report", seq: 1, buttons: 0x1000, lx: 42, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0 });
  ok(s.faults === 0, "ordinary fake report does not invalidate owner");
  s.child.emitJson({ event: "sink-disposed" });
  ok(s.faults === 1, "native fake sink disposal revokes ownership before process exits");
  ok(!s.child.killed && s.child.exitCode === null, "early owner revocation does not require killing child");
  assert.throws(() => s.sink.write({}), /unavailable/);
  checks++;
  const closing = s.sink.close();
  s.child.finish();
  await closing;
  ok(s.faults === 1, "late process exit never duplicates native fault callback");
}
for (const scenario of [
  { name: "ready before neutral", events: [{ event: "ready", v: 1, sink: "fake" }] },
  { name: "nonneutral startup", events: [{ ...NEUTRAL, buttons: 0x1000 }] },
  { name: "duplicate startup neutral", events: [NEUTRAL, NEUTRAL] },
  { name: "unknown event", events: [{ event: "execute" }] },
  { name: "frame acknowledgement before ready", events: [{ event: "frame", result: "ok" }] },
  { name: "malformed JSON", raw: "{broken\n" },
]) {
  const s = setup();
  if (scenario.raw) s.child.stdout.write(scenario.raw);
  else for (const ev of scenario.events) s.child.emitJson(ev);
  ok(await s.settled === "rejected", scenario.name + " rejects native readiness");
  await tick();
  ok(s.faults === 1, scenario.name + " triggers one fault callback");
  ok(s.child.kills === 1, scenario.name + " reaps invalid native child");
  await s.sink.close();
}
{
  const s = setup();
  s.child.emit("error", new Error("simulated spawn failure"));
  ok(await s.settled === "rejected", "child startup error rejects readiness");
  ok(s.faults === 1, "child startup error revokes one owner");
  s.child.finish(null);
  await s.sink.close();
}
{
  const s = setup();
  greet(s.child);
  ok(await s.settled === "ready", "second healthy child enters ready state");
  s.child.emitJson({ event: "ready", v: 1, sink: "fake" });
  ok(s.faults === 1 && s.child.kills === 1, "duplicate readiness after ACK fails closed");
  await s.sink.close();
}
{
  const s = setup();
  greet(s.child);
  await s.settled;
  const alive = setInterval(() => {}, 100); // keep event loop alive for unref'd reap timer
  try {
    await s.sink.close(); // parent EOF, but a stuck child never voluntarily exits
    ok(s.child.kills === 1, "750ms forced-reap limit kills stalled fake child");
    ok(s.faults === 0, "intentional shutdown does not generate a spurious owner fault");
  } finally {
    clearInterval(alive);
  }
}
console.log(String(checks) + " assertions");
console.log("gamepad-native-ipc verification passed (simulated child only)");
