/**
 * DEVELOPMENT-ONLY parent-owned .NET fake controller bridge.
 * Never imported by production server.js, and NO real Xbox sink is available.
 * The child has inherited pipes only, no port, shell or admin rights.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { GAMEPAD_MAX_BYTES, GAMEPAD_MAX_SEQ, validateGamepadState } from "../../src/gamepad/protocol.js";

const DLL = fileURLToPath(new URL("../../native/gamepad-sidecar/bin/Release/net8.0/WinDock.GamepadSidecar.dll", import.meta.url));
// Only the explicitly packaged private M0 LAB contains this self-contained fake executable.
const PORTABLE_FAKE_EXE = fileURLToPath(new URL("../../native/gamepad-sidecar/bin/Release/net8.0/win-x64/publish/WinDock.GamepadSidecar.exe", import.meta.url));

// launchChild override is for simulated, driver-free lifecycle tests ONLY.
function launchNativeFake() {
  // The Windows lab bundle runs without installing a system .NET runtime.
  // In source/CI builds the original fixed dotnet+DLL path remains in use.
  const portable = process.platform === "win32" && existsSync(PORTABLE_FAKE_EXE);
  return spawn(portable ? PORTABLE_FAKE_EXE : "dotnet",
    portable ? ["--fake-sink-test"] : [DLL, "--fake-sink-test"], {
    shell: false, windowsHide: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/** Only to be injected into createApp(...) by the explicitly invoked lab test. */
export function createFakeNativeSinkFactory({ onEvent = () => {}, onChild = () => {}, launchChild = launchNativeFake } = {}) {
  if (typeof onEvent !== "function" || typeof onChild !== "function" ||
      typeof launchChild !== "function")
    throw new TypeError("invalid lab bridge callbacks");

  return () => {
    const child = launchChild();
    let stopped = false;
    let failed = false;
    let fault = null;
    let sequence = 0;
    let stdout = "";
    let killTimer = null;
    let readySeen = false;
    let initialNeutralSeen = false;
    let readyResolve;
    let readyReject;
    const ready = new Promise((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;
    });
    const signalFault = () => {
      if (failed) return;
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
      if (failed) return;
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
          if (!event || typeof event !== "object" || typeof event.event !== "string")
            throw new Error("invalid native IPC event");
          if (event.event === "report") {
            // The child must create a neutral fake sink before it can claim
            // readiness. This is a state assertion, NOT XInput validation.
            if (!readySeen) {
              if (initialNeutralSeen || event.seq !== 0 ||
                  ["buttons", "lx", "ly", "rx", "ry", "lt", "rt"].some(key => event[key] !== 0))
                throw new Error("native startup report was not neutral");
              initialNeutralSeen = true;
            }
          } else if (event.event === "ready") {
            if (!initialNeutralSeen || readySeen || event.v !== 1 || event.sink !== "fake")
              throw new Error("unexpected native readiness event");
          } else if (event.event === "frame") {
            if (!readySeen || !["ok", "replay", "invalid", "expired", "closed", "sink-error", "clock-error"].includes(event.result))
              throw new Error("unexpected native frame acknowledgement");
          } else if (event.event !== "sink-disposed" && event.event !== "stopped") {
            throw new Error("unrecognized native IPC event");
          }
          onEvent(event);
          if (event.event === "ready") {
            readySeen = true;
            readyResolve();
          } else if (event.event === "sink-disposed" || event.event === "stopped") {
            // Revoke socket ownership when the child releases its sink,
            // without waiting for a delayed process exit.
            signalFault();
            return;
          }
        } catch { signalFault(); child.kill(); return; }
      }
    });
    onChild(child);

    return {
      ready, // Resolves only on native v1 fake-sink ACK, never on spawn alone.
      // This exact C# fake receiver emits seq=0 all-neutral during its
      // constructor, and the bridge verifies it BEFORE resolving ready.
      // Hub must NOT send an extra pre-ACK neutral frame: that prematurely
      // starts the independent 180ms native active-frame lease.
      nativeStartupNeutral: true,
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
        // Even when stdin has already failed, schedule eventual reaping.
        // The graceful EOF path still lets native dispose its fake sink.
        try { if (!child.stdin.destroyed) child.stdin.end(); }
        catch { signalFault(); }
        killTimer = setTimeout(() => { if (child.exitCode === null) child.kill(); }, 750);
        killTimer.unref?.();
        return done.finally(() => clearTimeout(killTimer));
      },
    };
  };
}
