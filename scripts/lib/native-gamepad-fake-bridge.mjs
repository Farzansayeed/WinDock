/**
 * DEVELOPMENT-ONLY parent-owned .NET fake controller bridge.
 * Never imported by production server.js, and NO real Xbox sink is available.
 * The child has inherited pipes only, no port, shell or admin rights.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { GAMEPAD_MAX_BYTES, GAMEPAD_MAX_SEQ, validateGamepadState } from "../../src/gamepad/protocol.js";

const DLL = fileURLToPath(new URL("../../native/gamepad-sidecar/bin/Release/net8.0/WinDock.GamepadSidecar.dll", import.meta.url));

/** Only to be injected into createApp(...) by the explicitly invoked lab test. */
export function createFakeNativeSinkFactory({ onEvent = () => {}, onChild = () => {} } = {}) {
  if (typeof onEvent !== "function" || typeof onChild !== "function")
    throw new TypeError("invalid lab bridge callbacks");

  return () => {
    const child = spawn("dotnet", [DLL, "--fake-sink-test"], {
      shell: false, windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stopped = false;
    let failed = false;
    let fault = null;
    let sequence = 0;
    let stdout = "";
    let killTimer = null;
    let readySeen = false;
    let readyResolve;
    let readyReject;
    const ready = new Promise((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;
    });
    const signalFault = () => {
      failed = true;
      if (!readySeen) readyReject(new Error("native fake receiver stopped before readiness"));
      if (!stopped) fault?.();
    };
    const done = new Promise(resolve => child.once("close", resolve));
    child.on("error", signalFault);
    child.on("close", signalFault);
    child.stdin.on("error", signalFault);
    // Always drain both output pipes to avoid a blocked native watchdog.
    child.stderr.resume();
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", chunk => {
      stdout += chunk;
      if (stdout.length > 8192) {
        signalFault();
        child.kill();
        return;
      }
      let pos;
      while ((pos = stdout.indexOf("\n")) !== -1) {
        const line = stdout.slice(0, pos).trim();
        stdout = stdout.slice(pos + 1);
        if (!line) continue;
        try {
          const event = JSON.parse(line);
          if (event?.event === "ready" &&
              (readySeen || event.v !== 1 || event.sink !== "fake"))
            throw new Error("unexpected native readiness event");
          onEvent(event);
          if (event?.event === "ready") {
            readySeen = true;
            readyResolve();
          }
        } catch { signalFault(); child.kill(); return; }
      }
    });
    onChild(child);

    return {
      ready, // Resolves only on native v1 fake-sink ACK, never on spawn alone.
      write(state) {
        if (stopped || failed || child.stdin.destroyed || sequence >= GAMEPAD_MAX_SEQ)
          throw new Error("native lab receiver unavailable");
        // Re-serialize whole state with a fresh NATIVE session sequence.
        // Never forward a client's untrusted sequence directly to the pipe.
        const frame = validateGamepadState({
          v: 1, type: "state", seq: sequence + 1, ...state,
        });
        if (!frame) throw new TypeError("invalid native report");
        const raw = JSON.stringify(frame) + "\n";
        if (Buffer.byteLength(raw) > GAMEPAD_MAX_BYTES + 1 ||
            !child.stdin.write(raw)) {
          signalFault(); // Do not buffer unbounded asynchronous device frames.
          throw new Error("native lab IPC backpressure");
        }
        sequence++;
      },
      onFault(handler) {
        if (typeof handler !== "function") throw new TypeError("fault handler required");
        fault = handler;
        if (failed && !stopped) queueMicrotask(handler);
      },
      close() {
        if (stopped) return done;
        stopped = true;
        child.stdin.end(); // Delivers EOF => native synchronously writes neutral.
        killTimer = setTimeout(() => child.kill(), 750);
        killTimer.unref?.();
        return done.finally(() => clearTimeout(killTimer));
      },
    };
  };
}
