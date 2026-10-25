# M0 private fake-controller lab — manual Windows/Android verification

**Code:** `feature/universal-gamepad`, M0e first implemented in `47c3aa5` (2026-10-25). Verify the latest GitHub commit and CI before running. Last published signed Gamepad Preview is **v46**, which does NOT include these newer debug-only M0 changes. This is a **fake** native receiver, not an Xbox controller or real in-game latency proof.

## Local prerequisites and safety

- Windows PC on a private LAN, Node.js 20+ (CI uses 24), and .NET 8 SDK to build the local FAKE sidecar. Windows private IPv4 must be supplied manually.
- An Android source-built **DEBUG** APK from this branch is optional for physical testing, and must be safe to install independently. Do **NOT** uninstall, overwrite or downgrade your already installed permanently signed Preview or regular WinDock. Standard debug APK signing may conflict with existing Preview; stop and leave hardware test NOT TESTED rather than uninstall.
- Do not download/run HIDMaestro, install drivers, elevate, modify machine trust/certificates, disable Windows security protections, publish an APK/release, merge branches or buy licences. Never post pairing PIN, cookies, tokens, internal network address or private logs.

## Checks that do not need any physical device

Run from branch root:

```sh
npm ci --ignore-scripts --no-audit --no-fund
node scripts/verify-gamepad-lab-observer.mjs
npm test
```

The standalone observer prints **14 assertions** and `gamepad-lab-observer verification passed (fake diagnostics only)`. Windows GitHub CI separately builds/runs the C# fake sidecar, native watchdog/EOF/replay tests and paired WS tests. Android CI runs JVM unit tests and lint. These automated tests cannot claim phone hardware operation.

## Optional normal-user Windows fake-lab execution

Stop regular WinDock on port **8620**, then open a non-elevated PowerShell in the repository root:

```powershell
dotnet build native/gamepad-sidecar/WinDock.GamepadSidecar.csproj -c Release
node scripts/gamepad-fake-lab-server.mjs 192.168.1.20
```

**192.168.1.20 is only an example.** Replace with the private IPv4 actually assigned to the Windows PC. The script refuses public/loopback hosts and non-Windows systems. You should see the fake lab URL and a locally shown pairing PIN. Use the existing trusted Wi-Fi/private network, and do not globally disable your firewall.

On an independently safe-installed **DEBUG** Android APK built from this same branch: connect to the exact displayed fake server URL, complete normal PIN pairing, enter **Touch & sign → Gamepad**, then deliberately tap **Paired LAB (fake only)**. After actual receiver readiness expect **PAIRED FAKE RECEIVER — NO XBOX**. Press/release A and move/recenter the left stick. Expect fixed-text `FAKE A press/release` and `FAKE left stick moved/centered` console notices, never raw input values. No Xbox controller appears.

Switch from Gamepad back to Touchpad or background/close the app; expect no retained held input in the fake receiver and native cleanup. On Windows, Ctrl+C closes the manually started host and reports fake report counts, A/stick transition counters, and host decode/validate/sink-call p50/p95/p99/max ms. If there were no accepted reports, quantiles are `n/a`. Console notices are capped at 16 per run, and instrumentation is opt-in to the manual lab. **These numbers are not network RTT, true phone-to-PC one-way delay, driver latency or finger-to-game delay.**

If the test requires uninstalling your signed Preview, stop. A separate-install development variant needs to be established before safe physical testing. Native fail-neutral watchdog remains **180 ms**; do not relax it to pass tests.

## Evidence, checklist and next milestone

- Prior owner's physical Windows Preview, read-only XInput baseline, Android v25 tests and v40 backend audit remain PASS; never request repeat.
- M0e standalone observer test: **14/14 PASS on agent's Node 22 Linux environment**. New exact-head multi-platform CI status must be checked.
- Real Android DEBUG ↔ Windows fake controller and LAN timing: **NOT TESTED**. Do not mark complete without an actual device observation.
- HIDMaestro/real Xbox hardware/multiplayer: **NOT IMPLEMENTED/NOT AUTHORIZED**.
- Next: verify CI, repair failures, then establish safe, separate DEBUG APK installation if needed, and perform genuine phone-to-fake receiver input/disconnect acceptance. Later instrument true RTT with clock-safe methods; do not claim one-way latency from unaligned clocks.
