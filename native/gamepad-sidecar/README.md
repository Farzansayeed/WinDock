# Isolated native gamepad receiver (TEST HARNESS ONLY)

A persistent .NET 8 child process reading whole-state protocol-v1 JSON lines
through **inherited stdin** and emitting diagnostic JSON events through stdout.
The channel is a private pipe, not a network port, and the separate native
`ControllerReceiver` timer neutralizes a fake sink after 180 ms without
accepted frames (or after 1 second without the first frame). Invalid protocol,
oversized frames (more than 256 bytes), stdin EOF, and pipe failure terminate
the owner and release neutral. Replays do not refresh the timer.

Only `--fake-sink-test` is accepted; every other invocation refuses (code 64).
**No Windows virtual Xbox/XInput controller is created.** No unsigned driver,
elevation, certificate changes, licence requests, gameplay, or production
`/gamepad` activation. Existing WinDock features are unchanged.

```powershell
dotnet build native/gamepad-sidecar/WinDock.GamepadSidecar.csproj -c Release
node scripts/test-gamepad-sidecar.mjs
```

Future Node integration must be explicit, supervised and behind the existing
paired/same-origin single-owner `/gamepad` gate, with a fixed executable,
`shell:false`, stderr handling, child termination, and safe output backpressure.
Do not expose fake mode via production networking. A real signed, legally
redistributable, offline-friendly Xbox backend requires owner approval for
privileged install and separate real-Windows XInput/game/rollback tests.

## Lab-only authenticated bridge

`scripts/lib/native-gamepad-fake-bridge.mjs` provides a factory **used only by**
`scripts/test-gamepad-bridge.mjs`, not the production server. That Windows CI
integration test pairs via the existing PIN and same-Origin rules, enforces
single ownership, forwards small whole-state frames into a child process,
and checks native independent expiration, WS disconnect, and child-crash
cleanup. It never turns `/gamepad` on in ordinary WinDock execution.
The Node hub now supports an optional `onFault` hook for any future safe
sink, immediately closing a session when the sink dies. The lab bridge now also
exposes a **native-acknowledged readiness promise**: a paired WebSocket receives
`ready` only after the child reports `{event:ready,v:1,sink:fake}`, and frames
sent before that acknowledgement terminate the owner fail-neutral. A child exit,
rejected startup, late ACK or synchronous fault cannot reopen the session.
The 1-second first-frame/startup bound is independent of process-spawn success.
The production route still returns HTTP 503 without an approved backend.
