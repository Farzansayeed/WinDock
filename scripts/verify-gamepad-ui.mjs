/**
 * Gamepad preview: exercise the actual WinDock input-pad source with browser/
 * WebSocket doubles. This intentionally tests navigation and mouse release
 * without claiming to implement a physical game controller.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createChecker } from "./lib/assert.mjs";

const t = createChecker("gamepad-ui");
const source = readFileSync(join(import.meta.dirname, "../public/input-pad.js"), "utf8");
// Dependencies are replaced only in this test: the mode-selection code itself is
// evaluated exactly as shipped. Do not import browser globals on the Node host.
const body = source.replace(/^import .*$/gm, "").replace("export function createInputPad", "function createInputPad");
t.ok(body.includes('if (next === "gamepad")'), "gamepad explicitly branches away from the live touchpad channel");
t.ok(body.includes('previous.send(\'{"type":"release"}\')'), "existing mouse channel releases input when switching");

const nodes = new Map();
let apiCalls = 0, socketCloses = 0;
const sockets = [];
const $ = (id) => {
  if (!nodes.has(id)) {
    const events = {};
    const element = {
      id, children: [], dataset: {}, style: { setProperty() {} },
      classList: { add() {}, remove() {} }, open: false, hidden: false, disabled: false,
      clientWidth: 750, clientHeight: 300, value: "",
      addEventListener(type, handler) { (events[type] ??= []).push(handler); },
      click() { for (const handler of events.click ?? []) handler({ currentTarget: element, target: element }); },
      close() { element.open = false; for (const handler of events.close ?? []) handler({}); },
      showModal() { element.open = true; },
      setAttribute(name, value) { element[name] = value; },
      focus() {}, setPointerCapture() {},
      getBoundingClientRect() { return { left: 0, top: 0, width: 750, height: 300 }; },
      getContext() { return { clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, stroke() {}, fill() {} }; },
      parentElement: { clientWidth: 760, clientHeight: 300, style: {}, parentElement: { clientWidth: 760, clientHeight: 310 } },
    };
    nodes.set(id, element);
  }
  return nodes.get(id);
};
const documentMock = { getElementById: $, addEventListener() {}, hidden: false };
const windowEvents = new Map();
const windowMock = { addEventListener(type, handler) {
  const handlers = windowEvents.get(type) ?? [];
  handlers.push(handler);
  windowEvents.set(type, handlers);
} };
class ResizeObserverMock { observe() {} }
class GestureMock {
  constructor() { this.points = new Map(); }
  flush() { return false; }
  reset() { this.points.clear(); }
  down() {} up() {} update() {}
}
const keyboardMock = () => ({ reset() {}, paint() {}, configure() {}, message() {} });
class SocketMock {
  static OPEN = 1;
  constructor(url) { this.url = url; this.readyState = 1; this.bufferedAmount = 0; this.messages = []; sockets.push(this); }
  send(raw) { this.messages.push(raw); }
  close() { this.readyState = 3; socketCloses++; }
}
const noop = () => {};
const fakeStorage = { getItem: () => null, setItem() {} };
const createFactory = new Function(
  "TouchpadGestures", "createRemoteKeyboard", "document", "window",
  "ResizeObserver", "location", "localStorage", "setTimeout", "clearTimeout",
  "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame", "matchMedia",
  body + "\nreturn createInputPad;",
);
const createInputPad = createFactory(
  GestureMock, keyboardMock, documentMock, windowMock, ResizeObserverMock,
  { protocol: "http:", host: "localhost:8620" }, fakeStorage,
  () => 1, noop, () => 2, noop, () => 3, noop, () => ({ matches: false }),
);
const pad = createInputPad({
  api: async (path) => { apiCalls++; t.equal(path, "/api/input", "normal input modes use the existing API"); return { available: true, demo: false, signatureInsert: false, keyboard: {} }; },
  notify: noop, WebSocketClass: SocketMock, storage: fakeStorage,
});
const tick = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

pad.open("touchpad");
await tick();
t.equal(sockets.length, 1, "touchpad opens its existing input socket");
sockets[0].onmessage({ data: '{"type":"ready"}' });
$("mouse-drag").click();
t.ok(sockets[0].messages.some((s) => s.includes('"down":true')), "touchpad drag can be held before the mode switch");

const previousApiCalls = apiCalls;
$("touchpad-gamepad").click();
await tick();
t.equal(apiCalls, previousApiCalls, "Gamepad preview never requests live controller capabilities or data");
t.equal($("input-pad").dataset.mode, "gamepad", "Gamepad shortcut opens the new input mode");
t.equal($("gamepad-pane").hidden, false, "Gamepad pane is displayed");
t.equal($("touchpad-pane").hidden, true, "Touchpad pane is hidden");
t.equal(sockets[0].readyState, 3, "old live touchpad connection closes on mode switch");
t.ok(sockets[0].messages.includes('{"type":"release"}'), "held mouse button is released before leaving Touchpad");
t.equal($("input-gamepad-tab")["aria-pressed"], "true", "Gamepad tab exposes active state");

$("gamepad-touchpad").click();
await tick();
t.equal(apiCalls, previousApiCalls + 1, "one-tap Gamepad to Touchpad recreates live input");
t.equal(sockets.length, 2, "returning to Touchpad opens a new input connection");
t.equal($("gamepad-pane").hidden, true, "Gamepad pane hides again");
t.equal($("touchpad-pane").hidden, false, "Touchpad pane returns without dashboard navigation");

$("input-signature-tab").click();
await tick();
t.equal($("signature-pane").hidden, false, "original Signature remains accessible");
t.equal($("gamepad-pane").hidden, true, "Signature hides Gamepad preview");
pad.disconnect();
t.equal(socketCloses, 2, "all opened touchpad sessions were closed");

// The Android native controller must not expose the old web Gamepad preview
// behind its overlay; plain browsers above still retain that UI as before.
let nativeOpens = 0;
windowMock.WinDockAndroid = { openGamepad() { nativeOpens++; } };
pad.open("touchpad");
await tick();
const beforeNative = sockets.length;
$("touchpad-gamepad").click();
await tick();
t.equal(nativeOpens, 1, "Android opens exactly one native controller surface");
t.equal($("input-pad").dataset.mode, "touchpad", "underlying Android pane remains Touchpad");
t.equal($("gamepad-pane").hidden, true, "old web gamepad preview is hidden behind native UI");
t.equal(sockets.length, beforeNative, "native Gamepad entry did not launch a duplicate input socket");
for (const handler of windowEvents.get("windock-gamepad-action") ?? [])
  handler({ detail: { action: "touchpad" } });
await tick();
t.equal($("input-pad").dataset.mode, "touchpad", "native exit goes directly to Touchpad");
t.equal(sockets.length, beforeNative + 1, "native exit restores the original touchpad input");
pad.disconnect();
t.done("gamepad-ui verification passed");
