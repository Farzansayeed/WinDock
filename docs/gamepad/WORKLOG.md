# WinDock Gamepad — chronological worklog

**Canonical tracker:** [PROGRESS.md](PROGRESS.md)  
**Location:** `Farzansayeed/WinDock`, branch `feature/universal-gamepad`.  
**Rules:** newest entries at top; don't fabricate passing checks or completion; document actual code/test/decision evidence each work session. Every code batch should update this file and PROGRESS.md in the same commit. Do not log pairing secrets/device-specific private data.

---

## 2026-10-24 — P5 isolated paired Gamepad WebSocket channel with no unsafe fake controller

**User priority:** Park Spotify/brightness/dock regression investigations (still unresolved) and resume unfinished Gamepad phases. Current P2 XInput virtual driver remains unproven. Chose implementation independent of any privileged driver before device approval.

**Source changes:** src/gamepad/hub.js is a new /gamepad WebSocket channel, separate from /input and read-only state sync. It uses existing paired-cookie authorization + same-Origin check, a single owner lock, 256-byte full snapshots, per-session increasing sequence gate (replays ignored, do not extend timeout), 180ms timer-based stale fail-neutral, invalid/binary/rate/authorization/disconnect cleanup and sink close. Backend sink injection is explicit. When no real native sink is configured (production today), WebSocket upgrade returns HTTP 503 — NOT a fake Xbox controller, NOT keyboard emulation, and no packet state accepted. server.js wires the isolated hub without changing existing mouse/input channel.

**Automated test:** scripts/verify-gamepad-hub.mjs creates a real HTTP/WS WinDock test server and in-memory fake sink; tests authenticated ownership, origin refusal, second-client conflict, valid/replay/malformed state, active timer cleanup/neutral on inactivity and abrupt disconnect, disabled production route. Registered into npm test. This tests security/logic only, NOT Android native sending or Windows virtual XInput output.

**Safety:** No driver installed or bundled, no UAC, no cloud gameplay, no new app account or arbitrary OS device access. Real native sink must itself fail neutral on process crash independent of Node timer; this Node gate alone is NOT sufficient for Xbox input safety.

**Verification:** GitHub npm and CI pending at commit creation; actual device tests none. Next step implement native .NET 8 timer-driven device-independent receiver + fake output tests and assess P2 signed driver deployment in isolated reversible environment. Then wire Android input and native XInput backend when available. P8 Touchpad latency deferred.

---

## 2026-10-24 — Universal desktop launcher Preview v16 published; CI/installer green

**Universal desktop launcher Preview v16 verified (2026-10-24):** [WinDock Gamepad Preview 0.2.3-gamepad.16](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.16-gf8d8a0e) is published and non-draft from source commit `f8d8a0e`; [Windows+Android release workflow #40011693658](https://github.com/Farzansayeed/WinDock/actions/runs/40011693658) **PASSED** Windows native helper build, installer installation/upgrade/uninstall smoke, Android APK/unit/lint+permanent keystore signer validation, and release publication. [CI #40011693770](https://github.com/Farzansayeed/WinDock/actions/runs/40011693770) passed Linux, macOS, Windows and aggregate. Both Windows/Android packages, BUILD-INFO.txt, SHA256SUMS.txt and PUBLIC SIGNING-INFO.txt are present. **Actual user's WinDock Spotify/window focus, other app and running dot, DDC/CI, and Android in-place upgrade remain UNTESTED on physical devices**; never claim universal resolution solely on CI.

**User next acceptance:** Quit regular WinDock tray before preview (same port 8620), update PC and paired phone to matching v16 packages through approved update flow. Test Spotify when already running with one visible window among multiple processes, then fully close/relaunch; repeat with Notepad and another classic app; confirm running dot appears/disappears, no duplicate unnecessary process, and actual visible/foreground window. Test browser shortcut with profile args separately to catch regressions. Record Windows/phone results in PROGRESS/WORKLOG. If focus still fails, Windows foreground restrictions or saved tile target/args may be responsible; don't silently elevate, kill process or reinstall.

---

## 2026-10-24 — Generic Win32 existing-window activation for multi-process desktop apps (owner-approved universal fix)

**Owner evidence:** Spotify's classic Roaming Spotify.exe succeeds via Start-Process. Eight Spotify processes are visible but only one (Spotify Free) has a nonzero MainWindowHandle. This is characteristic of multi-process desktop frameworks, so an app-name special case would be wrong.

**Universal native implementation:** New native/win/ExecutableWindows.cs enumerates only processes sharing the executable's base name, checks a NONZERO MainWindowHandle and verifies their full MainModule.FileName equals the selected executable path (Windows case-insensitive). Background helper child processes without a window and unrelated programs with the same filename in another directory are NOT considered the active app. Missing permissions/process exit skips a candidate; no elevation or Windows security-policy changes. WinDockHelper Program.Launch first tries to restore/focus this existing matching desktop window when shortcut arguments are empty. For explicit arguments/profiles, preserve existing Process.Start behavior so profile-specific browser launches aren't hijacked. If no window can be activated, normal launch still runs. Program.Focus reuses common BringWindowForward and always detaches any foreground thread-input attachment in finally. Packaged/MSIX apps remain on separate IApplicationActivationManager flow.

**User-facing state:** This is a reusable native Windows enhancement for ALL classic Windows desktop apps with a visible window, including CEF/Electron/multi-process apps; not hardcoded to Spotify. It still cannot prove an unseen newly launched app makes a visible window, and Windows may restrict foreground focus. Old Steam/game launchers whose executable differs from their actual window's binary may still need explicit shortcut mapping. Earlier v13 Store-app COM and v14 pending async response improvements are orthogonal.

**Regression gates:** Added platform-agnostic launch source safety assertions (exact executable path + nonzero window; no Spotify constants, shortcut arguments preserved, input-thread detach). Windows native C# build, CI and new preview publication REQUIRED. Physical test on owner's PC/phone REQUIRED (Spotify already running in background then tap; closed then tap; other classic programs, Store apps, tile dots, Windows foreground). No physical run claimed.

**Next:** Inspect CI and actual fork preview download matching this source, then user tests running/focus/relaunch behavior. If direct Spotify works but dock still fails, use WinDock launch error and saved tile args/target plus actual Windows session/foreground diagnostics, never reinstall blindly. Full gamepad driver P2 and VS1 remain pending; P8 touchpad tuning deferred.

---

## 2026-10-24 — Spotify classified as classic Win32; eliminate artificial HTTP launch delay

**Owner's real PowerShell evidence:** Get-StartApps lists Spotify with an AppID pointing at a Spotify.exe under the user's Roaming AppData; Get-AppxPackage -Name '*Spotify*' returned nothing; Test-Path "$env:APPDATA\\Spotify\\Spotify.exe" was True. Thus this installation is an **unpackaged Win32 executable**, NOT Store/MSIX. The v13 IApplicationActivationManager COM change was limited to Store-packaged applications and **cannot explain or fix this Spotify instance**. Retain the v13 COM improvement for other Store apps; do not claim it repaired Spotify.

**Source issue verified:** The launch endpoint in server.js awaited hub.broadcast() after a helper returned. hub.broadcast() calls dockState(), which invokes Windows PowerShell running-process enumeration. That can take seconds and delays the phone's Launch requested toast even though the native launch helper already acknowledged. Focus/close had the same unnecessary post-action response block.

**Fix:** After successful provider.launchApp/focusApp/closeApp, respond HTTP 200 immediately, then launch an asynchronous hub.broadcast() with errors contained; the paired live-state sync/poll still updates dots. Added a live API integration regression that deliberately blocks the Windows running-process enumeration while verifying a launch response completes early and the delayed background scan really started.

**Limitations:** This is a RESPONSE-LATENCY FIX, not proof Spotify launches. Classic Windows Spotify.exe is still started through native Process.Start; it can return success despite the app failing to display or exiting immediately, or an already-running hidden instance. PC test: confirm Spotify opens directly in Windows Start and via "Start-Process -FilePath \"$env:APPDATA\\Spotify\\Spotify.exe\""; inspect process/window after clicking WinDock. If direct launch fails, investigate Spotify itself; if direct works but WinDock does not, inspect WinDock installation and saved tile target/args versus current shortcut. No reinstall, no elevation and no deletion of Spotify data until diagnosed.

**Tests:** npm/CI/release build PENDING for this patch. Test explicitly opens a paired WebSocket before blocking a second running-state scan, proving that an active broadcast cannot delay the HTTP response. Physical owner Spotify start and running-dot verification NOT performed.

**Next:** Verify CI and published preview, then compare real direct Windows Spotify launch and phone tile with the same PC session. Keep previous brightness/running dots issues open until hardware confirmation.

---

## 2026-10-23 — Spotify packaged COM activation Preview v13 published with CI passing

**Verified Preview v13 (2026-10-23):** [WinDock Gamepad Preview 0.2.3-gamepad.13](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.13-gf164ea0) published **NON-DRAFT** from commit `f164ea0`; [release workflow #40008801028](https://github.com/Farzansayeed/WinDock/actions/runs/40008801028) and [multi-platform CI #40008801048](https://github.com/Farzansayeed/WinDock/actions/runs/40008801048) succeeded. Both Windows/Android installers, SHA256SUMS.txt, BUILD-INFO.txt and PUBLIC SIGNING-INFO.txt are published, Windows installer smoke and Android keystore signature checks passed. **No physical Spotify activation or in-place upgrade has yet been tested.**

**How to diagnose owner install:** In PowerShell without admin run Get-StartApps filtering Spotify, Get-AppxPackage *Spotify*, and Test-Path "$env:APPDATA\Spotify\Spotify.exe". If Store packaged and Start launches, test packaged WinDock v13 route; if Win32 EXE, the COM improvement does not apply. If Spotify doesn't launch from Start, debug Spotify installation itself independently. The "Launch requested" toast is not proof of an opened window.

**Next:** Collect user-installed Spotify type and physical Spotify start/WinDock result, only then mark issue fixed. Same security/signed preview/driver v1 and P8 deferral constraints.

---

## 2026-10-23 — Spotify launch: desktop vs Store packaging; native activation improvement

**User issue:** Windows Spotify tile takes a while to report Launch requested and Spotify never opens. Spotify desktop is a Chromium Embedded Framework desktop client (NOT just a browser PWA), installable as either traditional Win32 Spotify.exe or a Microsoft Store packaged desktop app. Actual user's installation variant is unknown.

**Cause hypothesis grounded in code:** Packaged app helper used Process.Start on shell:AppsFolder AUMID, which can report success without proving the app started. Microsoft's documented IApplicationActivationManager.ActivateApplication returns a real Windows HRESULT and process ID.

**Code:** Changed ONLY the Store/MSIX packaged activation route to COM IApplicationActivationManager created via CLSCTX_LOCAL_SERVER (short-lived helper), with strict existing app identity validation, HRESULT and processId checks. Node provider returns sanitized HTTP 502 and Start-menu troubleshooting if COM activation fails. Existing Win32 Spotify.exe launch remains unchanged. Added JS regression tests checking packaged COM path and failure reporting.

**Verification:** CI and a new release pending; **no physical Spotify launch on user's Windows**. Successful activation returns PID but doesn't prove visible app window. The user may have classic Spotify.exe instead; if so the COM fix won't affect that path. Ask for Get-StartApps (Spotify AppID), Get-AppxPackage Spotify and Test-Path user roaming Spotify.exe, plus whether Spotify opens from Start. Do not change protected WindowsApps ACLs.

**Next:** Check Windows CI/build/release, then test user's actual install type and launch; record field result before calling fixed.

---

## 2026-10-23 — Regression-fix Preview v12 tested in CI and published

**Verified 2026-10-23:** [WinDock Gamepad Preview v0.2.3-gamepad.12](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.12-g2e80adb) from code commit `2e80adb` published successfully: [release build #40002230727](https://github.com/Farzansayeed/WinDock/actions/runs/40002230727) Windows installer build/installer smoke, Android APK build/unit/lint + configured permanent signer verification, and publication all PASSED. [multi-platform CI #40002230776](https://github.com/Farzansayeed/WinDock/actions/runs/40002230776) Windows, Linux, macOS and aggregate PASSED. Both Windows installer and Android APK, BUILD-INFO, SHA256SUMS and SIGNING-INFO assets were verified present via GitHub API. **NO physical owner Windows app launch/DDC monitor, phone running-indicator regression or Windows/Android self-upgrade was tested.**

**User acceptance steps:** On Windows completely quit the regular WinDock app before running Gamepad Preview (both bind port 8620). Install matching v12 PC + Android Preview packages; if Android v11 installed, the new v12 APK should update via Android system confirmation with the same stable signing key, but **NOT yet user-tested**. Directly launch and close e.g. Notepad on Windows and verify dock running dot appears/disappears within a few seconds without manual refresh. Tap a dock app tile and see whether a visible app window opens; **Launch requested** alone is NOT proof. Check external monitor DDC/CI enabled in OSD and compatible picture/HDR mode, retry brightness. Report app names, screen model/connection and whether Windows itself launches them; do not request PINs/passwords. Record outcome and remaining failures in PROGRESS/WORKLOG.

---

## 2026-10-23 — User-reported app state, launch and monitor brightness failures; regression repair

**User observation:** Installed Preview showed "Opened: App" but no visible app, and running-app dots did not update after external app exits or launches. Brightness button returned "Could not adjust display brightness; check DDC/CI".

**Source audit:** src/sync.js, server.js, public/app.js, src/platform/windows.js and native/win/Brightness.cs matched fork main exactly before this fix; failures cannot be causally attributed to a Gamepad-specific edit from source diff alone. WebSocket only broadcast state on connected clients and WinDock API mutations; **no periodic scan existed for apps launched/closed elsewhere**. UI showed "Opened" merely after a helper launch request returned, not after Windows confirmed a visible window. Brightness code had only read-level-based primary DDC/CI write, with no alternative VCP fallback if high-level WRITE was rejected.

**Changes:** Added bounded 3-second, connected-clients-only, non-overlapping host running-state polling with fingerprint suppression of unchanged snapshots; resilient scan errors; explicit cleanup on socket hub close. Android browser now displays "Launch requested"/"Focus requested" and asks for a fresh snapshot shortly after each request; do not claim app opened until running status confirms. Added sync integration tests for external app exit, next launch and no duplicate unchanged broadcasts. Native Windows brightness falls back to VCP 0x10 with its own range when high-level DDC/CI write fails (hardware support permitting).

**Safety/limitations:** Physical Windows app launch can still fail for independent OS reasons: expired shortcut, elevation/UAC boundary, single-instance application, wrong target or focus restriction. The UI now reports requests honestly but cannot force Windows to open an application. Some monitors lack writable DDC/CI or block it in HDR/picture modes; the fallback cannot bypass monitor firmware. No kernel driver, privilege escalation or monitor menu changes. **Real PC/monitor hardware testing outstanding.**

**Tests:** CI/npm/Windows builds pending after this code commit; physical device acceptance pending. Do not mark the reported issue fully resolved without confirmation from user.

**Next:** Verify GitHub CI and publish matching new Windows+Android Preview release, have owner quit regular WinDock before Preview (both port 8620), test app launch and external close/open running dots after ~3 seconds; test monitor DDC menu and read-only brightness diagnostic, record actual monitor model/connection and results; then return to P2 Windows virtual Xbox driver proof.

---

## 2026-10-23 — Consolidated next-chat handoff + status/documentation corrections

**Requested:** Save everything future ChatGPT/Codex chats need in AGENTS.md and repository docs, including precise current status, user-approved requirements, build/signing details, unresolved Windows driver gate, risks and next steps.

**Documentation changes:** Replaced root AGENTS.md with a concise binding instruction map. Created docs/gamepad/SESSION-HANDOFF.md with complete source/test/release inventory, branch and safety constraints, signed v11 milestone, no-private-key policy, pending phone/PC upgrade/driver/VS1 tests and source precedence. Linked it from 00-START-HERE.md, INSTALL-PREVIEW.md, UPDATES.md, roadmap and progress. Corrected historical P1/P3/CI/release statuses and obsolete Android signing checkboxes. No application logic altered.

**Evidence:** Verified GitHub branch HEAD, non-draft signed [v11 release](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e) with SIGNING-INFO, passing [build #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556), [CI #39998130774](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) and docs [CI #39998883980](https://github.com/Farzansayeed/WinDock/actions/runs/39998883980). Documentation-only commit has not yet passed any new CI. **No physical phone or Windows virtual-gamepad test took place.** No private secrets accessed.

**Next:** Future chat reads AGENTS.md and SESSION-HANDOFF.md, verifies current GitHub evidence, then assists owner with physical v11 and next same-key Android update OR progresses approved P2 Windows signed virtual XInput proof/VS1. Update PROGRESS and WORKLOG in every meaningful code commit. P8 Touchpad latency deferred.

---

## 2026-10-23 — FIRST PERMANENTLY SIGNED PREVIEW v11 PUBLISHED AND VERIFIED IN ACTIONS

**User setup:** User created a personal WinDock JKS using JDK 21 and said they configured all FOUR private GitHub Actions signing secrets. No key file, password or encoded key material was accessed or committed by the assistant.

**Verified build:** [Preview GitHub Actions #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) PASSED. Android job successfully loaded dedicated signing values, assembled/tested/linted APK, and confirmed APK signer certificate SHA-256 matched the configured keystore public certificate. Windows job built and smoke-tested installer; publish job PASSED. [Multi-platform CI #39998130774](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) PASSED.

**Release:** [WinDock Gamepad Preview 0.2.3-gamepad.11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e), commit `175942e`, published with **Android APK + Windows installer + SHA256SUMS.txt + BUILD-INFO.txt + SIGNING-INFO.txt**. SIGNING-INFO carries the PUBLIC signing certificate SHA256 for future cross-version comparisons. Private key not published.

**Meaning:** The APK is signed with the owner's configured permanent keystore, *not* an ephemeral per-run key. This establishes build provenance, **NOT a physically verified Android in-place upgrade**. Old ephemeral-debug APKs require one-time Preview-only uninstall if signatures differ. Still need second version with matching fingerprint and actual Android system installer test; full gamepad is only UI/local input preview.

**Next:** User downloads and installs v11 Preview (may uninstall only old Preview once), retains offline private JKS backup. On subsequent release compare public certificate SHA256 fingerprints and test smooth in-place Android upgrade preserving preview-local settings. Check WinDock Preview PC and Android manual updater; resume P2 driver feasibility and VS1.

---

## 2026-10-23 — Persistent Android Preview signing: owner reports secrets configured; hard provenance gate committed

**Owner action:** User confirmed all four GitHub Actions repository signing secrets have been added. Secret **values were NOT fetched, viewed, copied or committed**. GitHub metadata listing was unavailable to this tool, so source configuration is the only verified information until a fresh run.

**Change:** The feature-branch GitHub Actions APK build now requires all four secrets; missing values FAIL the build rather than silently revert to a per-run debug keystore. After building, it compares the public SHA-256 certificate fingerprint of APK signer to the same fingerprint exported from the configured keystore and fails on mismatch. It records only the PUBLIC certificate fingerprint in SIGNING-INFO.txt, attaches it to build artifacts and the GitHub prerelease. Release notes explain the mandatory one-time migration from old ephemeral-key APKs.

**Tests:** At commit time, a new Actions run must confirm secrets load, APK is signed by the configured private key, Windows+Android build/tests succeed, and SIGNING-INFO.txt reaches a published release. No real APK upgrade was attempted on the user's phone.

**Next:** Check latest workflow run/release assets and public fingerprint. Record build evidence; then install a freshly signed Preview APK (may require uninstall old Preview once), preserve private JKS offline and verify a NEXT signed release has an identical public signer fingerprint and can update in place with OS confirmation.

---

## 2026-10-23 — Updater CI evidence checked; release/physical verification pending

**Verified:** [CI run #39994885297](https://github.com/Farzansayeed/WinDock/actions/runs/39994885297) succeeded on Windows, Linux and macOS and overall CI for `0deb4b84`, which includes the fork updater docs and Android parser tests; [CI run #39994402883](https://github.com/Farzansayeed/WinDock/actions/runs/39994402883) succeeded for optional signing integration. The Android unit/build/lint job of preview run [39994403042](https://github.com/Farzansayeed/WinDock/actions/runs/39994403042) passed. Windows installer and final prerelease publication for the newest update-enabled workflow were still in progress/pending at time of check.

**Not verified:** No private stable signing key configured, no physical Android update, no end-user Windows installer update, no claim of seamless installation. A previous preview release v7 exists but predates the latest Android update flow.

**Next:** Check preview job and resulting release API/assets, then perform actual signed upgrade verification and restore/update documentation evidence.

---

## 2026-10-23 — Fork preview updater, private Android signing option, full agent handoff

**Code:** Windows Preview tray now has a fork-only Check for updates action; approved installer is size/SHA-256 checked and launched after a second prompt. Android Preview Phone options has a GitHub update check, verified APK download and Android system install consent. Added Windows update parser test fixtures, Android parser tests, debug FileProvider. CI can accept a private stable preview APK signing key via four GitHub secrets; absent secrets fall back to ephemeral debug signing. No silent install.

**Documentation:** Created UPDATES.md with complete workflow, signing instructions, threat boundaries, tests, file map and next developer actions. Updated AGENTS.md, PROGRESS.md, INSTALL-PREVIEW.md and START-HERE.md.

**Tests:** New updater source + signing pipeline need latest GitHub CI/build checks and real PC/Android upgrade validation; no physical upgrade or new stable signing key claimed. Prior preview v5 was verified before this update.

**Next:** Fix any updater CI failures; verify new preview release; owner configures signing secrets on GitHub (never in chat); perform real user-consented upgrades, then continue P2 Windows virtual XInput feasibility and VS1.

---

## 2026-10-23 — Version 0.2.3-gamepad.5 successfully released (native local input)

**Published:** [WinDock Gamepad Preview 0.2.3-gamepad.5](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.5-g0a81c22), commit `0a81c22`, [GitHub preview run #39991422753](https://github.com/Farzansayeed/WinDock/actions/runs/39991422753) **success** for both Android and Windows jobs, installer smoke and prerelease publication. [General CI #39991422757](https://github.com/Farzansayeed/WinDock/actions/runs/39991422757) passed, as did docs update CI #39992009777. Release contains separate Android APK, Windows preview installer, BUILD-INFO.txt and SHA256SUMS.txt.

**Functionality:** Android native **local-only** MotionEvent left stick + A overlay inside Touch & sign with direct return to Touchpad. This version **does not** control games, have a Windows virtual driver, or support all customizable controls. Physical Android device/Windows gamepad input acceptance tests remain outstanding.

**Next:** Install the matched v5 Android + Windows preview packages on actual devices, verify native multitouch ownership/return behavior and collect bugs; independently clear P2 signed XInput driver gate before implementing authenticated VS1 transport.

---

## 2026-10-23 — First native Android input screen (local-only implementation)

**Changed:** Native `GamepadTouchModel.kt` pointer-ID model (fixed left analog stick + A button) and `GamepadTouchView.kt` custom native Canvas/MotionEvent input surface, launched via `@JavascriptInterface openGamepad()` in the existing `MainActivity.kt` only on the trusted/paired foreground WebView. Added return-to-Touchpad event and immediate native overlay teardown/neutral on Back, pause, disconnect and activity destruction. Web-only clients retain the existing noninteractive preview. Service-worker cache version bumped. Added `GamepadTouchModelTest.kt` pure JVM tests.

**Scope:** This is **local input visualization only**, NOT an authenticated controller transport, virtual Windows gamepad, full customizable editor, or end-to-end multiplayer/game test. The PC receives no gamepad state; existing Touchpad/WebSocket path remains separate. No vibration/gyro added.

**Tests:** [CI #39991422757](https://github.com/Farzansayeed/WinDock/actions/runs/39991422757) passed on Windows/Linux/macOS; the Android build/unit/lint job of [preview workflow #39991422753](https://github.com/Farzansayeed/WinDock/actions/runs/39991422753) passed for commit `0a81c22`. Installer/release publishing job was still in progress when checked. **No physical Android or Windows gamepad test.** P2 driver installation/signing remains undecided.

**Next:** Fix any CI issues, inspect latest preview download, run phone gesture tests, then P2 Windows signed XInput proof/VS1 connection.

---

## 2026-10-23 — Preview publishing retry after GitHub 403 (CI troubleshooting)

**Found:** Windows and Android build jobs both passed for [preview run 39989554161](https://github.com/Farzansayeed/WinDock/actions/runs/39989554161), but publish failed: GitHub REST returned HTTP 403 "Resource not accessible by integration" during `gh release create`. Job token log advertised `Contents: write`, so exact reason remains unverified. Retry of the failed publish job was requested via connected GitHub action; **not yet confirmed successful**. Newer versioned run for `d66074ce` remains in progress.

**Impact:** Previously published [v0.2.3-gamepad.2](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.2-gd8663f6) remains available and unaffected. Even on a failed publish job, Windows/Android artifact ZIPs can be downloaded from the Actions run with GitHub sign-in while retained. Do not mark a release published unless release API shows assets.

**Next:** Check rerun result, determine whether GitHub token policy/abuse rate limiting affects release creation, and use Actions artifacts as fallback. Do not weaken repo security permissions without understanding cause.

---

## 2026-10-23 — GitHub build/test status reviewed (documentation)

**Verified existing successful assets:** Preview [0.2.3-gamepad.2](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.2-gd8663f6) from `d8663f6`; [preview build run 39988429549](https://github.com/Farzansayeed/WinDock/actions/runs/39988429549) and [general CI run 39988429632](https://github.com/Farzansayeed/WinDock/actions/runs/39988429632) completed successfully, with Windows installer, Android APK, checksums and build identity. The intermediate JavaScript protocol commit `7caf907d` passed [general CI run 39989554258](https://github.com/Farzansayeed/WinDock/actions/runs/39989554258). Windows/.NET dual-language commit `d66074ce` has now **passed** [multi-platform CI run 39989884526](https://github.com/Farzansayeed/WinDock/actions/runs/39989884526), but **a newer release is not yet confirmed**.

**Manual hardware state:** No personally installed APK/installer or Windows virtual Xbox device tested in this chat. Next: check new dual-language CI; physical device/driver proof remains open.

---

## 2026-10-23 — Matching native .NET 8 gamepad state parser, fail-neutral lease and CI tests (code; CI pending)

**Changed:** Added `native/gamepad-tests/WinDock.GamepadTests.csproj`, `GamepadState.cs`, `Program.cs`. The Windows-only test job and Windows preview installer gate now validate a zero-driver, hardware-independent C# parser with the *same strict snapshot fields* and range checks as `src/gamepad/protocol.js`. It rejects malformed, replayed, oversized, unsupported or reserved-button frames, and neutralizes all fields on invalid, timed out or closed sessions.

**Limits:** This is **not** a virtual controller, Windows input worker, network transport, or security boundary. It runs entirely as an isolated native test and does not install drivers. No real Windows controller/device demonstrated.

**Tests:** Windows/Linux/macOS [CI run 39989884526](https://github.com/Farzansayeed/WinDock/actions/runs/39989884526) **passed** for commit `d66074ce`, including the new C# model. Preview-package workflow for that commit has not yet been confirmed published; no physical Windows controller test. Prior JS test results separately tracked below.

**Next:** Confirm dual-language CI and numbered prerelease, then P2 real Windows XInput device proof and VS1 Android stick+A transport.

---

## 2026-10-23 — Gamepad v1 state protocol and fail-neutral model (code; CI pending)

**Changes:** Added `src/gamepad/protocol.js` defining a driver-neutral 10-field controller snapshot, explicit Xbox-style button mask, byte-size and numeric bounds, parser rejecting malformed/unknown fields, and a per-session gate rejecting stale/replayed frames while going neutral on invalid state, timeout or close. Added `scripts/verify-gamepad-protocol.mjs` with exhaustive positive/negative and timeout coverage; registered in `test/run.mjs`. This is isolated from the existing `/input` touchpad and *not* yet connected to Android, Windows or a network route.

**Security boundaries:** Authorization, transport ownership, cryptographic exchange, device driver and native Windows watchdog are NOT implemented by this module. A module-level timeout is a testable contract, not a production safety guarantee. All old touchpad behavior remains untouched.

**Tests:** Awaiting GitHub CI after commit. No physical game controller or Android/Windows hardware tested. No claim of playable gamepad support.

**Next:** Verify CI protocol tests, implement a compatible test-only .NET receiver model / fixture parity, finish P2 XInput backend proof on real Windows and then VS1 paired Android→Windows one-stick+A.

---

## 2026-10-23 — FIRST DOWNLOADABLE WINDOWS AND ANDROID PRERELEASE VERIFIED

**Release:** [WinDock Gamepad Preview 0.2.3-gamepad.1](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.1-gc631611) from commit `c631611`, GitHub Actions [preview run #39988106341](https://github.com/Farzansayeed/WinDock/actions/runs/39988106341). The Windows and Android build jobs, publish job, installer smoke test, Android unit/lint/signature validation succeeded. General [CI run #39988106319](https://github.com/Farzansayeed/WinDock/actions/runs/39988106319) also passed. Download assets confirmed: WinDockGamepadPreviewSetup.exe, WinDockGamepadPreview-Android.apk, SHA256SUMS.txt and BUILD-INFO.txt.

**What this proves:** Buildable/installable-package artifacts exist with version-tagged provenance and checksums; GitHub Windows automated install/launch/upgrade/uninstall smoke passed. **No owner's physical PC/Android installation or real gamepad input has been tested.** Android APK uses debug signing; Windows installer is unsigned. The Gamepad UI remains preview-only and P2 virtual Xbox driver proof remains open.

**Next:** Verify latest preview release and then perform manual Windows/Android setup and pairing test; continue driver feasibility. Do not claim stable release.

---

## 2026-10-23 — Downloadable preview workflow and version control (implementation, unverified release)

**User request:** Provide practical Windows/Android packages and keep them properly versioned with every meaningful code change, plus update project documentation.

**Committed source changes:** GitHub Actions build-and-prerelease workflow at .github/workflows/gamepad-preview.yml; separate preview Windows AppId/shortcut/uninstall/config and non-upstream updater; Android preview applicationId suffix and build-run version stamp; PowerShell preview packaging and installer smoke-test variants; installation guide and fork README clarification.

**Release policy:** Code push triggers Windows+Android build, full npm tests, Windows native and installer smoke checks, Android unit/lint and APK verification. A GitHub prerelease with two binaries and SHA256SUMS/BUILD-INFO is created only when both jobs succeed. Tag incorporates base version, run number and source Git SHA. Docs-only commits do not rebuild. Preview binaries remain unsigned/debug-signed; Android update across independent CI signing keys may require uninstalling old preview.

**Evidence and limits:** Source and workflow files committed. GitHub Actions might be disabled or jobs might fail; **no successful installable package or prerelease is claimed merely by committing this workflow**. No Windows installer, Android APK, or virtual Xbox gamepad was built inside this chat's tooling. Must inspect GitHub workflow results and actual download links before marking packaging verification done.

**Next:** Inspect Actions and fix build errors; validate both preview artifacts and installer smoke tests, then provide actual release links once GitHub generates them. Continue Windows virtual controller P2 in parallel; P8 Touchpad optimization remains deferred.

---

## 2026-10-23 — P2 read-only Windows XInput diagnostic (implementation)

**Branch:** `feature/universal-gamepad`; this change adds a standalone diagnostic, not a virtual gamepad implementation.

**Changed:** New `native/gamepad-probe/WinDock.GamepadProbe.csproj`, `Program.cs`, `README.md`: .NET 8 console tool that only calls `XInputGetState` to scan the four Xbox-compatible slots or watch button/axis/trigger changes for a fixed duration. New `scripts/verify-gamepad-probe.mjs` checks source-level no-installer/no-controller-emission invariants; `test/run.mjs` registers the oracle. Windows CI builds the console and runs its `--help` command with no driver operations. Updated driver feasibility plan, tracker and handoff.

**Tests:** The committed `scripts/verify-gamepad-probe.mjs` checks were executed in a sandboxed JavaScript evaluation of the current GitHub source with **19 assertions passed**, covering read-only XInput, .NET 8 project and lack of driver installation calls. **This was not a full Node/npm run.** C# has **not** been compiled on Windows or tested with real controller hardware. GitHub Actions API returned **0 runs** for the feature branch after this commit and no commit-status checks; full npm test/CI remains unverified. No driver installed, virtual Xbox created, UAC elevation, certificate trust change or manual test performed.

**Next:** Run full npm/CI, perform P1 visual/manual Android checks, then on a safe Windows machine run `--scan` baseline and compare to a separately vetted/approved driver demonstration; capture XInput and rollback evidence. P2 gate remains open.

---

## 2026-10-23 — Open-source research + deferred Touchpad latency phase (documentation only)

**Changes:** Added [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md), reviewing PhonePad, PadConnect Android/Receiver, Custom-Controller, KaifCoding Virtual Gamepad, Dish Android/Satellite, and Phone-Controller against WinDock. Documented architecture patterns, authenticated UDP vs insecure variants, neutral watchdog, packet layout, double-deadzone effects, GPL/MIT/Apache licensing, driver and benchmark caveats, and exact integration map. Added [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md), scheduled **only after a working, tested Gamepad v1 completes P7**. Updated PROGRESS, roadmap, handoff and AGENTS guidance.

**Source evidence:** Read projects' public GitHub READMEs and available LICENSE/SECURITY/protocol/benchmark/architecture files, plus current WinDock `public/input-pad.js`, `src/input-hub.js`, `src/platform/input.js`, `native/win/Touchpad.cs`. Project performance values belong to their respective authors.

**Implementation:** Documentation/planning only. No external project source code or drivers imported; no modifications to Touchpad runtime, Android native gamepad, Windows virtual controller or input transport.

**Tests:** Not run for this documentation-only change. Previous mocked Gamepad UI test evidence remains as recorded below; full npm/CI/phone+PC timing unresolved.

**Next:** Complete P1 real-device/full-suite checks, P2 signed/distributable virtual XInput driver feasibility, and VS1 real Android one-stick+A path; later P3–P7 full Gamepad. **P8 follows only after Gamepad release**, not now.

---

## 2026-10-23 — Verified mocked mode switch and prepared Windows driver test gate

**Phase/status:** P1 preview code present, awaits full npm/CI + physical Android tests; P2 driver feasibility **research documented, hardware proof not begun**.
**Verified:** Executed the persisted `scripts/verify-gamepad-ui.mjs` source with the actual current `public/input-pad.js` in a mocked execution environment; **21 assertions passed**. It tested opening a Touchpad WebSocket, holding/releasing a simulated mouse drag, switching to non-networking Gamepad preview, returning to live Touchpad and accessing Signature. This is *not* a Node/npm test suite run or device test.
**CI:** GitHub Actions API for this feature branch returned **zero workflow runs** at check time. Not marked passing; fork Actions enablement needs checking.
**Changed:** Created [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md), a strict safe-driver evaluation/rollback checklist, candidate research, and go/no-go criteria. Updated live tracker.
**Next:** Verify P1 on actual Android and through full `npm test`, then run P2 standalone proof on controlled Windows without silently elevating Node or installing unapproved certificates.

---

## 2026-10-23 — Persisted functional Gamepad mode-switch regression oracle

**Phase/status:** P1 code integrated, **not yet verified by full npm/CI or on an Android phone**.
**Changed:** Added `scripts/verify-gamepad-ui.mjs` with a mocked DOM and WebSocket to execute WinDock's actual `public/input-pad.js` selection code and assert safe exit/reentry, release of held mouse buttons and continued Signature navigation. Wired it into `test/run.mjs` so normal `npm test` will execute it.
**Evidence:** Equivalent standalone mock executed against the committed source through GitHub integration and **passed 16 behavioral assertions**, including Touchpad → Gamepad → Touchpad, release on switch, reopening live input and Signature.
**Tests:** The full `npm test` suite and physical Android/PC tests are **not run** in this environment. An equivalent in-process smoke test passed; the newly persisted Node oracle is not yet CI-confirmed.
**Next:** Run feature branch suite in a native checkout or Actions; continue P2 virtual controller proof-of-concept research; test UX in Android WebView.

---

## 2026-10-23 — P1 Gamepad preview integrated into Touch & sign (code change)

**Branch:** `feature/universal-gamepad`
**Phase/status:** P1 implementation committed; automated and physical-device verification pending; P2 driver proof not started.
**Changed:**
- `public/index.html`: third Gamepad tab, fullscreen Touchpad Gamepad shortcut, in-mode Touchpad return button, visibly noninteractive schematic controller preview.
- `public/input-pad.js`: explicit Gamepad mode, clean Touchpad disconnect/release on switch, no gameplay socket or host API requests for preview.
- `public/style.css`, `public/icons.js`: gamepad icon and responsive near-black preview consistent with WinDock.
- `public/sw.js`: cache namespace bumped so older HTML/JS isn't kept by installed PWAs.
- `scripts/verify-pwa.mjs`: static test assertions for navigation DOM and explicit preview-only behavior.
- `.github/workflows/ci.yml`: enable existing CI on feature-branch pushes in this fork.

**Tests:** Fixed a static assertion that mistakenly searched for `socket.send` instead of the existing `previous.send` release call. Source-level consistency checks performed; **`npm test`, GitHub CI results, Android UI and physical-game tests have NOT been confirmed yet**. See PROGRESS for acceptance gate. Do not claim working gamepad input.

**Next:** Check feature-branch CI status and run `npm test`; manually verify the UI on Android; then continue P2 driver/XInput proof-of-concept safely.

---

## 2026-10-23 — Critical product and engineering plan audit (documentation only)

**Phase/status:** P2 backend feasibility spike and P1 thin UI shell are next in parallel; P0 remains complete. Added [AUDIT.md](AUDIT.md) with driver feasibility, .NET 8/10 incompatibility, administrator/certificate trust, virtual-device licensing, reliability, pairing, UI interaction, and performance-risk findings. Updated [PROGRESS.md](PROGRESS.md) with VS1 minimum playable gate and decision checklist; updated developer handoff instructions and roadmap priority.

**Source review:** GitHub fork code and project docs; external HIDMaestro, libvirtualhid and ViGEmBus documentation. External SDK/driver performance claims have **not** been independently reproduced.

**Tests:** Not run (planning/docs only). No Windows virtual device installed, no Kotlin app built, no controller test, no physical device latency measurement.

**Blocked or uncertain:** Chosen signed/redistributable virtual controller backend, driver installation privileges/certificates, viable .NET integration and actual game compatibility remain unresolved, **not failed tests**.

**Next:** P2 isolated safe Windows virtual Xbox feasibility spike + P1 minimal Touch & sign integration in parallel; then VS1 real-phone one-stick+A test before full layout editor or UDP work.

---

## 2026-10-23 — Project tracking initialized (documentation only)

**Change:** Created canonical phase-by-phase [PROGRESS.md](PROGRESS.md) (P0–P7) and this chronological log, added links and required-update policy to `AGENTS.md` and `00-START-HERE.md`. Existing plans and UI screenshot contact sheet already existed in the feature branch.

**Verified:** The fork, `feature/universal-gamepad` branch, and these existing files were read from GitHub before writing: `docs/gamepad/00-START-HERE.md`, `docs/gamepad/UI-REFERENCE.md`, `docs/gamepad/assets/current-ui-screenshots.webp` (repository tree), `public/index.html`, `public/input-pad.js`, `public/style.css`, and `.github/workflows/ci.yml`.

**Implementation status:** No Gamepad code, native Android controller, virtual Windows device or network transport has been implemented as part of this worklog entry.

**Tests:** Not run (documentation-only commit). No real hardware/latency measurements.

**Next:** P1: Introduce Gamepad as a third UI-only mode within existing `#input-pad`, direct Touchpad ↔ Gamepad navigation, accurate "preview only" label and regression tests. In parallel, plan P2 driver feasibility research before committing to a virtual-device stack.

**Blockers:** None for P1; virtual Windows driver license/installation feasibility not yet determined.

---

## Worklog entry template (copy for each future development batch)

```markdown
## YYYY-MM-DD — Short description

**Branch / commit:** `feature/universal-gamepad` / `SHA or PR`
**Phase/status:** P# / IN PROGRESS, BLOCKED, or DONE
**Changed:** Source files and behavior.
**Evidence:** Relevant screenshots, tests, Windows controller detection or reproducible steps.
**Tests:** Commands executed + pass/fail (or explicitly not run and why).
**Decisions:** Changes in scope/architecture, with rationale.
**Open issues / blockers:** Specific observable problems.
**Next:** The next concrete incremental task.
```
