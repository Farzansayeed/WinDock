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
