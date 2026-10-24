/**
 * v1 controller state contract for the FUTURE gamepad channel.
 *
 * This module intentionally does not expose a WebSocket, HTTP route, or device
 * driver. Authentication/ownership must be checked at the transport boundary.
 * It is NOT used by the current Gamepad UI-only preview.
 *
 * Full snapshots permit the receiver to recover from dropped analog updates.
 * Buttons need immediate edge-triggered snapshots so short taps are not lost.
 */

export const GAMEPAD_MAX_BYTES = 256;
export const GAMEPAD_MAX_SEQ = 0x7fffffff;
export const GAMEPAD_ALLOWED_BUTTONS = 0xf3ff; // XInput D-pad, Start, Back, thumb, LB/RB, ABXY.

export const GAMEPAD_BUTTON = Object.freeze({
  dpadUp: 0x0001, dpadDown: 0x0002, dpadLeft: 0x0004, dpadRight: 0x0008,
  menu: 0x0010, view: 0x0020, leftStickPress: 0x0040, rightStickPress: 0x0080,
  lb: 0x0100, rb: 0x0200,
  a: 0x1000, b: 0x2000, x: 0x4000, y: 0x8000,
});

const FIELDS = Object.freeze(["v", "type", "seq", "lx", "ly", "rx", "ry", "lt", "rt", "buttons"]);
const AXES = ["lx", "ly", "rx", "ry"];
const TRIGGERS = ["lt", "rt"];

export function neutralGamepadState() {
  return { lx: 0, ly: 0, rx: 0, ry: 0, lt: 0, rt: 0, buttons: 0 };
}

export function validateGamepadState(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const keys = Object.keys(value);
  if (keys.length !== FIELDS.length || FIELDS.some((key) => !Object.hasOwn(value, key))) return null;
  if (value.type !== "state" || value.v !== 1
    || !Number.isInteger(value.seq) || value.seq < 1 || value.seq > GAMEPAD_MAX_SEQ) return null;
  for (const key of AXES) {
    if (!Number.isInteger(value[key]) || value[key] < -32768 || value[key] > 32767) return null;
  }
  for (const key of TRIGGERS) {
    if (!Number.isInteger(value[key]) || value[key] < 0 || value[key] > 255) return null;
  }
  if (!Number.isInteger(value.buttons) || value.buttons < 0 || value.buttons > 65535
    || (value.buttons & ~GAMEPAD_ALLOWED_BUTTONS) !== 0) return null;
  // Never retain caller-controlled prototypes, unknown data or mutable aliases.
  return {
    v: 1, type: "state", seq: value.seq,
    lx: value.lx, ly: value.ly, rx: value.rx, ry: value.ry,
    lt: value.lt, rt: value.rt, buttons: value.buttons,
  };
}

/** Only parse small UTF-8 JSON payloads; transport authorization is separate. */
export function decodeGamepadState(data) {
  const size = typeof data === "string" ? Buffer.byteLength(data, "utf8")
    : data instanceof Uint8Array ? data.byteLength : Infinity;
  if (size === 0 || size > GAMEPAD_MAX_BYTES) return null;
  try {
    return validateGamepadState(JSON.parse(
      typeof data === "string" ? data : Buffer.from(data).toString("utf8"),
    ));
  } catch {
    return null;
  }
}

/**
 * A single owned session's fail-neutral state machine.
 * No ownership/auth check is performed here; callers MUST verify those first.
 * Invalid protocol => kill session; replay/old seq => ignore (without
 * extending freshness); stale frames => neutral and require NEW session.
 */
export function createGamepadStateGate({ timeoutMs = 180, now = () => performance.now() } = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 50 || timeoutMs > 1000
    || typeof now !== "function") throw new TypeError("invalid gamepad state timeout");
  let lastSeq = 0;
  let lastAt = null;
  let closed = false;
  let state = neutralGamepadState();
  const expire = () => {
    closed = true;
    state = neutralGamepadState();
  };
  return {
    accept(value) {
      if (closed) return { accepted: false, reason: "closed", state: { ...state } };
      const time = now();
      if (!Number.isFinite(time) || (lastAt !== null &&
          (time < lastAt || time - lastAt > timeoutMs))) {
        expire(); return { accepted: false, reason: "expired", state: { ...state } };
      }
      const next = validateGamepadState(value);
      if (!next) {
        expire(); return { accepted: false, reason: "invalid", state: { ...state } };
      }
      if (next.seq <= lastSeq) return { accepted: false, reason: "replay", state: { ...state } };
      lastSeq = next.seq;
      lastAt = time;
      state = {
        lx: next.lx, ly: next.ly, rx: next.rx, ry: next.ry,
        lt: next.lt, rt: next.rt, buttons: next.buttons,
      };
      return { accepted: true, reason: "ok", state: { ...state } };
    },
    poll() {
      const time = now();
      if (!closed && lastAt !== null && (!Number.isFinite(time) ||
        time < lastAt || time - lastAt > timeoutMs)) expire();
      return { closed, state: { ...state } };
    },
    close() { expire(); return { closed, state: { ...state } }; },
    get closed() { return closed; },
  };
}
