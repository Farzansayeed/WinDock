import { createChecker } from "./lib/assert.mjs";
import {
  GAMEPAD_BUTTON, GAMEPAD_MAX_BYTES, GAMEPAD_ALLOWED_BUTTONS,
  validateGamepadState, decodeGamepadState, createGamepadStateGate, neutralGamepadState,
} from "../src/gamepad/protocol.js";

const t = createChecker("gamepad-protocol");
const base = () => ({
  v: 1, type: "state", seq: 1, lx: -32768, ly: 32767, rx: 0,
  ry: 120, lt: 0, rt: 255, buttons: GAMEPAD_BUTTON.a | GAMEPAD_BUTTON.lb,
});

t.equal(GAMEPAD_ALLOWED_BUTTONS, 0xf3ff, "XInput button allowlist is explicit");
t.equal(GAMEPAD_BUTTON.a, 0x1000, "A matches XInput gamepad constant");
t.equal(GAMEPAD_BUTTON.menu, 0x0010, "Menu maps to XInput START");
t.equal(GAMEPAD_BUTTON.view, 0x0020, "View maps to XInput BACK");
t.ok(validateGamepadState(base()) !== null, "extreme normalized axes accepted");
t.deepEqual(validateGamepadState(base()), base(), "valid complete snapshot passes exactly");
t.deepEqual(decodeGamepadState(JSON.stringify(base())), base(), "string payload decodes");
t.deepEqual(decodeGamepadState(Buffer.from(JSON.stringify(base()))), base(), "byte payload decodes");
t.equal(validateGamepadState(null), null, "null rejected");
t.equal(validateGamepadState([]), null, "array rejected");
for (const [name, override] of [
  ["unknown field", { unexpected: true }],
  ["type is unexpected", { type: "release" }],
  ["version is unsupported", { v: 2 }],
  ["zero sequence", { seq: 0 }],
  ["negative sequence", { seq: -1 }],
  ["fractional sequence", { seq: 0.5 }],
  ["sequence above max", { seq: 2147483648 }],
  ["left axis overflow", { lx: 32768 }],
  ["right axis underflow", { rx: -32769 }],
  ["float axis", { ry: 0.5 }],
  ["NaN", { lx: NaN }],
  ["right trigger overflow", { rt: 256 }],
  ["left trigger negative", { lt: -1 }],
  ["float trigger", { lt: 3.1 }],
  ["reserved Xbox bit", { buttons: 0x0400 }],
  ["sign bit", { buttons: -1 }],
  ["truncated bit field", { buttons: 65536 }],
  ["non-integer button", { buttons: 1.5 }],
  ["numeric string injection", { lx: "42" }],
]) {
  t.equal(validateGamepadState({ ...base(), ...override }), null, name + " rejected");
}
const missing = base(); delete missing.buttons;
t.equal(validateGamepadState(missing), null, "missing required field rejected");
t.equal(decodeGamepadState("{oops"), null, "malformed JSON rejected");
t.equal(decodeGamepadState("{}"), null, "empty object rejected");
t.equal(decodeGamepadState(" ".repeat(GAMEPAD_MAX_BYTES + 1)), null, "oversize JSON rejected");
t.equal(decodeGamepadState(new Uint8Array(GAMEPAD_MAX_BYTES + 1)), null, "oversize binary rejected");
t.equal(decodeGamepadState(new Uint8Array(0)), null, "empty binary rejected");
t.equal(decodeGamepadState(123), null, "non-frame rejected");

let clock = 1000;
const gate = createGamepadStateGate({ timeoutMs: 180, now: () => clock });
const first = gate.accept(base());
t.equal(first.accepted, true, "first authorized-by-caller snapshot accepted");
t.equal(first.state.buttons, GAMEPAD_BUTTON.a | GAMEPAD_BUTTON.lb, "held buttons preserved");
first.state.buttons = 0;
t.equal(gate.poll().state.buttons, GAMEPAD_BUTTON.a | GAMEPAD_BUTTON.lb, "returned state cannot mutate the gate");
clock += 80;
t.equal(gate.accept(base()).reason, "replay", "equal sequence cannot replay a press");
clock += 70;
t.equal(gate.accept({ ...base(), seq: 0 }).reason, "invalid", "malformed frame closes session");
t.equal(gate.poll().state.buttons, 0, "invalid input neutralizes held buttons");
t.equal(gate.accept({ ...base(), seq: 2 }).reason, "closed", "invalid session cannot resume");

clock = 0;
const stall = createGamepadStateGate({ timeoutMs: 180, now: () => clock });
t.ok(stall.accept(base()).accepted, "stall case starts with held A");
clock = 170;
t.ok(!stall.poll().closed, "alive shortly before deadline");
clock = 181;
t.ok(stall.poll().closed, "stale session closes after deadline");
t.deepEqual(stall.poll().state, neutralGamepadState(), "stale session resets axes and buttons");
t.equal(stall.accept({ ...base(), seq: 2 }).reason, "closed", "no revival after timeout");

clock = 0;
const reorders = createGamepadStateGate({ timeoutMs: 180, now: () => clock });
t.ok(reorders.accept(base()).accepted, "valid state accepted");
clock = 100;
t.equal(reorders.accept({ ...base(), seq: 1 }).reason, "replay", "out-of-order seq rejected");
clock = 181;
t.ok(reorders.poll().closed, "replayed frames do not extend freshness");
const sent = createGamepadStateGate({ timeoutMs: 180, now: () => 0 });
t.ok(sent.accept(base()).accepted, "new connection initially connected");
t.deepEqual(sent.close().state, neutralGamepadState(), "explicit close releases triggers, buttons, sticks");

t.throws(() => createGamepadStateGate({ timeoutMs: 0 }), "zero watchdog timeout not permitted");
t.throws(() => createGamepadStateGate({ timeoutMs: 5000 }), "huge watchdog timeout not permitted");
t.done("gamepad-protocol verification passed");
