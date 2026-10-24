// Real .NET child-process tests with fake controller reports; Windows CI only.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const dll = fileURLToPath(new URL("../native/gamepad-sidecar/bin/Release/net8.0/WinDock.GamepadSidecar.dll", import.meta.url));
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const frame = (seq, buttons = 0x1000) => JSON.stringify({
  v: 1, type: "state", seq, lx: 1234, ly: -4321, rx: 0, ry: 0,
  lt: 0, rt: 0, buttons,
});
let count = 0;
function ok(value, reason) { count++; assert.ok(value, reason); }
function launch(args = ["--fake-sink-test"]) {
  const child = spawn("dotnet", [dll, ...args], {
    shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"],
  });
  let buffer = "";
  const events = [];
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", data => {
    buffer += data;
    let end;
    while ((end = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, end).trim();
      buffer = buffer.slice(end + 1);
      if (line) events.push(JSON.parse(line));
    }
  });
  const done = new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
  return { child, events, done };
}
async function waitFor(pred, reason, ms = 3000) {
  const until = Date.now() + ms;
  while (!pred() && Date.now() < until) await pause(10);
  ok(pred(), reason);
}
async function run(testFn) {
  const s = launch();
  try {
    await waitFor(() => s.events.some(x => x.event === "ready" && x.sink === "fake"),
      "only fake sink becomes ready");
    await testFn(s);
  } finally {
    s.child.stdin.destroy();
    if (s.child.exitCode === null) s.child.kill();
    await s.done;
  }
}
const refused = launch([]);
ok((await refused.done).code === 64, "no approved device backend refuses launch");
ok(!refused.events.some(x => x.event === "ready"), "no default real sink");

await run(async s => {
  const reports = () => s.events.filter(x => x.event === "report");
  ok(reports()[0].buttons === 0, "new native device starts neutral");
  s.child.stdin.write(frame(1) + "\n");
  await waitFor(() => reports().some(x => x.buttons === 0x1000), "A press reaches fake sink");
  s.child.stdin.write(frame(1, 0) + "\n");
  await waitFor(() => s.events.some(x => x.result === "replay"), "replay detected");
  ok(reports().filter(x => x.buttons !== 0).length === 1, "replay does not change state");
  const exit = await s.done;
  ok(exit.code === 0, "native timer stops held session without stdin traffic");
  ok(reports().at(-1).buttons === 0 && reports().at(-1).lx === 0, "timeout resets all controls");
  ok(s.events.filter(x => x.event === "sink-disposed").length === 1, "sink disposed once");
});
await run(async s => {
  s.child.stdin.write(frame(1) + "\n");
  await waitFor(() => s.events.some(x => x.buttons === 0x1000), "invalid-frame test pressed A");
  s.child.stdin.write("{}\n");
  ok((await s.done).code === 0, "invalid state terminates");
  ok(s.events.some(x => x.result === "invalid"), "invalid state rejected");
  ok(s.events.filter(x => x.event === "report").at(-1).buttons === 0, "invalid resets buttons");
});
await run(async s => {
  s.child.stdin.write(frame(1) + "\n");
  await waitFor(() => s.events.some(x => x.buttons === 0x1000), "EOF test pressed A");
  s.child.stdin.end(); // Models loss of parent-owned pipe, not a real PC/game test.
  ok((await s.done).code === 0, "stdin EOF terminates");
  ok(s.events.filter(x => x.event === "report").at(-1).buttons === 0, "EOF resets controls");
});
await run(async s => {
  ok((await s.done).code === 0, "idle without first frame times out");
  ok(s.events.some(x => x.event === "sink-disposed"), "idle timer releases sink");
});
await run(async s => {
  s.child.stdin.write("x".repeat(300) + "\n");
  ok((await s.done).code === 0, "oversize frame cannot keep sidecar alive");
  ok(s.events.some(x => x.result === "invalid"), "oversize frame rejected");
});
console.log(`${count} assertions`);
console.log("gamepad-sidecar verification passed (fake sink only)");
