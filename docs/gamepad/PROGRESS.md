<!-- 2026-10-23: signing security update — owner reports four GitHub Actions secrets provisioned; requires a new successful release proving signer consistency. -->
# WinDock Universal Gamepad — LIVE PROGRESS TRACKER

**2026-10-24 P2 OWNER POWERSHELL SIGNATURE FAILURE — PORTABLE BASELINE PATCH:** Owner already PASSED v25 Android Preview upgrade, native stick+A and original WinDock feature regressions; do not repeat. Windows read-only baseline remains NOT WORKING because no .NET SDK, and subsequent unsigned PowerShell .ps1 was refused by script execution policy (PSSecurityException, UnauthorizedAccess). No XInput test reached. New feature-branch commit adds release-built self-contained single-file win-x64/win-arm64 read-only XInput EXEs, Windows CI x64 execution and SHA256 in published assets. Both EXEs remain UNSIGNED; respect SmartScreen/WDAC/AppLocker warnings, never bypass protection or change policies. Prior baseline [d58c31f](https://github.com/Farzansayeed/WinDock/commit/d58c31f0f2096341cd4882383f63cd44ededf1e4) [CI #40117938713](https://github.com/Farzansayeed/WinDock/actions/runs/40117938713) PASSED, [Preview v27](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.27-gd58c31f) published. New CI/release PENDING at commit time; ARM64 only cross-built, owner's PC untested. No drivers, admin, signing keys, certificate-store changes or PC gameplay. Next: owner checksum-verified, policy-permitted normal Windows executable baseline ONLY; report error if blocked.

**2026-10-24 VERIFIED SDK-FREE WINDOWS BASELINE BUILD (not owner's PC):** Source [5a21ea5](https://github.com/Farzansayeed/WinDock/commit/5a21ea59d2755745b98e4c260086d07ef8ee5e21) passed [multi-platform CI #40117635358](https://github.com/Farzansayeed/WinDock/actions/runs/40117635358), including a Windows PowerShell 5.1 execution of `WinDock-XInputBaseline.ps1` from System32 with four slots, and [Preview release #40117635340](https://github.com/Farzansayeed/WinDock/actions/runs/40117635340) passed Android/Windows packaging/publish. [Non-draft Preview v26](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.26-g5a21ea5) verified has Android APK, Windows installer, checksums, build information and public signing information. Owner already PASSED both Preview v25 Android checks; these do **not** need repeating because no Android runtime behavior changed in this code increment. **Owner's Windows XInput baseline is the ONLY remaining owner check**: PowerShell-only read-only script, from any directory, with no .NET SDK. CI runner's XInput slot result is NOT owner hardware proof. P2 signed/offline/redistributable driver unselected; no real PC gameplay, driver install, admin or certificate trust changes.

**2026-10-24 P2 OWNER TEST FAILURE / SDK-FREE FIX:** Owner-confirmed Preview v25 Android upgrade **PASS** and Android Gamepad controls / original WinDock regressions **PASS**. Remaining read-only Windows baseline **NOT WORKING** because `dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --baseline` was invoked from `PS C:\\WINDOWS\\system32>` and returned `No .NET SDKs were found` / `application 'run' does not exist`. Missing SDK and wrong working directory are setup problems; XInput slots were NEVER READ. Added standalone SDK-free `native/gamepad-probe/WinDock-XInputBaseline.ps1` (built-in Windows PowerShell 5.1 Add-Type, read-only system XInputGetState, all four slots, Windows version/architecture, works from any CWD), updated README, Node source safety assertions and CI Windows probe from System32. Previous [commit 2c05bbd](https://github.com/Farzansayeed/WinDock/commit/2c05bbdda5da4a7eb856cce975bfb363a2db6513) [CI #40115473486](https://github.com/Farzansayeed/WinDock/actions/runs/40115473486) and [release #40115473511](https://github.com/Farzansayeed/WinDock/actions/runs/40115473511) passed; [Preview v25](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.25-g2c05bbd) published. **New Windows CI / owner physical P2 XInput baseline PENDING** at code commit; no drivers, elevation, cert trust, real XInput device or gameplay. Do not repeat the two accepted Android checks; only outstanding owner action is the SDK-free Windows baseline.

**2026-10-24 P4/P2 FAIL-NEUTRAL SAFETY INCREMENT (SOURCE, NO DRIVER):** Hardened .NET 8 StateLease and ControllerReceiver against clock rollback during accepted input, timer polls and the pre-first-frame grace period; refuse a first report after 1000 ms even if its timer callback is delayed. Added deterministic fake-sink rollback/deadline regression assertions in native/gamepad-tests/Program.cs. **Baseline before change:** [commit a2603b9](https://github.com/Farzansayeed/WinDock/commit/a2603b93ebe77a978b8a304ed522cf8850a8c1c2) [CI #40114291891](https://github.com/Farzansayeed/WinDock/actions/runs/40114291891) PASSED; published [v24](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.24-ga98eef2). Source mutation/static consistency checks performed at commit time, but .NET compilation/tests and new GitHub Actions **PENDING**; owner's P2 baseline, approved signed XInput driver, Android live socket and actual game test **NOT RUN**. No elevation, trust-store change, driver install or backend selection. **Next:** verify new CI, request safe v24/Windows baseline acceptance; evaluate only an explicitly approved legal/signed/offline driver on disposable Windows before enabling production Xbox output.

**2026-10-24 VERIFIED Preview v24 / P2 baseline + Kotlin ownership tests:** [Source `a98eef2`](https://github.com/Farzansayeed/WinDock/commit/a98eef26a74ddba11e97397aae3930ccd29b4997) passed [multi-OS CI #40113968394](https://github.com/Farzansayeed/WinDock/actions/runs/40113968394) and [Preview packaging/publishing #40113968453](https://github.com/Farzansayeed/WinDock/actions/runs/40113968453); the latter completed Android JVM unit/lint/signing, Windows installer smoke, and GitHub publish. Highest numbered non-draft [Gamepad Preview v24](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.24-ga98eef2) contains Android APK, Windows installer, public SIGNING-INFO, BUILD-INFO and SHA256SUMS. **Still NO active Android gamepad socket, production Xbox/XInput driver, PC gameplay, or safe privileged backend approval.** Owner v23 physical UI tests PASSED (reported) but v24 physical upgrade and read-only Windows baseline NOT YET RUN by owner. Edge tile showing M instead of logo is deferred. Next owner acceptance: v24 in-place Preview update + read-only P2 baseline; any unchecked item blocks advancement.


**2026-10-24 owner-accepted Preview v23; VS1 secure-session + P2 baseline work:** Owner explicitly confirmed all FOUR v23 real Android regression checks PASSED: distinct signed Preview install/update, paired local Gamepad navigation, two-pointer stick+A/neutral, Touchpad/Signature/keyboard/dock regression. These are **owner-reported physical results**, not independently observed or game-output proof. **New finding (DEFERRED):** Microsoft Edge tile/icon appears as letter **M** instead of its logo; track separately and do not address during Gamepad P2/VS1. New Android `GamepadSocketTarget` derives only same-origin LAN ws(s) /gamepad from trusted WebView target; `GamepadOwnerChannel` waits for strict server-ready v1, holds input until authenticated ownership is granted by caller, sends neutral first, closes on bad ack/timeout/clock rollback/transport loss, and delegates 40ms watchdog freshness to `GamepadInputSession`. Six injected fake-socket JVM tests. **No real Android socket/cookie wiring or production device sink!** P2 read-only `gamepad-probe --baseline` now prints Windows version/architecture and all four XInput slots without names, admin or driver changes; Windows CI probes runner (not owner's PC). **Prior HEAD `ab23f13` [CI #40111404640](https://github.com/Farzansayeed/WinDock/actions/runs/40111404640) passed; [v23 release](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.23-g325bcb6) verified. New commit CI/published release UNCHECKED at commit time**; physical P2 device, XInput gameplay and native Android network still NOT TESTED. **Next:** owner runs optional read-only P2 Windows baseline, then review signed/legal/offline driver with separate informed approval before privileged lab; keep progressing Android cookie/socket adapter against fake sinks, not production.


**2026-10-24 VERIFIED v23 build evidence (DOCS FOLLOW-UP):** Implementation [`325bcb6`](https://github.com/Farzansayeed/WinDock/commit/325bcb6a9ed820bb7c4ec2fa95d0eb592b78afc7) passed [multi-platform CI #40111015027](https://github.com/Farzansayeed/WinDock/actions/runs/40111015027) (Linux, Windows, macOS, aggregate) and [Preview release workflow #40111014996](https://github.com/Farzansayeed/WinDock/actions/runs/40111014996) (Android unit tests + lint + signing, Windows installer smoke, publish). Highest non-draft published release is [Gamepad Preview v23](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.23-g325bcb6) with Windows installer, Android Preview APK, BUILD-INFO, SHA256SUMS and PUBLIC SIGNING-INFO. **This proves source/build/test packaging only**, NOT owner phone install/update, Android network socket, XInput device, or PC gameplay. Local Kotlin sender still transport-injected and unused in normal Gamepad preview; /gamepad production 503 without approved driver. Owner physical Preview regression checklist required before next milestone acceptance. **No real driver was installed or approved.**


**2026-10-24 VS1 Kotlin input-lifecycle increment (SOURCE / LOCAL-ONLY):** Added `GamepadInputSession.kt` transport-injected sender with activation only after separately authenticated ready, initial neutral, immediate A edges, bounded/coalesced stick updates, 40-ms full-state heartbeat (requires future lifecycle timer), fresh sequence each session, idempotent neutral close and fail-closed clock/transport faults. `GamepadTouchView` exposes optional native-state callback (currently unset; preview remains LOCAL). Seven Kotlin/JVM tests added for ordering, timeout cadence, simulated cancellation, failure and fresh reconnect. **No Android socket attached or Windows XInput driver; production `/gamepad` remains disabled.** Previous [CI #40110375230](https://github.com/Farzansayeed/WinDock/actions/runs/40110375230) passed at [`3ba40ca`](https://github.com/Farzansayeed/WinDock/commit/3ba40cab60637a2d412d5f71af43b25c8207c1d1); latest published [Preview v22](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.22-g69ba9d7). Standalone local Kotlin smoke against matching production model/codec shapes passed; newly added Android JUnit, lint, release and physical host/phone are **NOT RUN at commit time**. Owner previously accepted checklist/docs changes with no findings. **Next:** examine new CI, preserve local-only UX, advance secure Android pairing/session transport only with non-driver fake-sink lab; P2 still requires explicit consent + real signed/reversible/offline hardware proof.


**2026-10-24 owner feedback box policy (DOCS ONLY):** The mandatory `AGENTS.md` end-of-session checklist now also requires an always-visible optional multiline **Other findings / observations** text area immediately under all checks, above the Proceed/Report issues actions. Free text is preserved while checking items and forwarded verbatim along with pass/fail states through either action; empty notes never block acceptance. If notes describe a failure, the affected check stays unchecked and blocks Proceed. Do not collect PINs/signing secrets or claim device tests based on notes. Prior policy-only [commit `7439033`](https://github.com/Farzansayeed/WinDock/commit/7439033f68b7eb816a9b4b114cd46a8b87d4e8bf) passed [CI #40110167483](https://github.com/Farzansayeed/WinDock/actions/runs/40110167483); latest Gamepad [Preview v22](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.22-g69ba9d7) remains experimental, no actual Windows XInput/Android gameplay validation. New docs-only commit CI unverified at commit time; physical/driver tests NOT RUN. **Next:** user accepts policy text, then resume P2/VS1 safely.


**2026-10-24 acceptance workflow policy (DOCS ONLY):** `AGENTS.md` now mandates an end-of-session interactive, initially unchecked, observable user test checklist and a user-initiated Proceed button. **Every unchecked item is NOT WORKING / unverified for acceptance and blocks the next roadmap step**; checked requires actual user confirmation; failures get a Report issues action and are fixed first. Never turn CI/mock checks into real-hardware claims. For docs-only changes test that the policy is readable; future feature checkpoints require specific, realistic device tests. **Prior implementation** [`69ba9d7`](https://github.com/Farzansayeed/WinDock/commit/69ba9d71997a9ff3913235c72b5d4f22f4897347) passed [CI #40109440668](https://github.com/Farzansayeed/WinDock/actions/runs/40109440668) and [Preview workflow #40109440597](https://github.com/Farzansayeed/WinDock/actions/runs/40109440597). This policy-only commit has no code/hardware test. New CI results not yet available at commit time. P2 real signed/offline XInput still blocked; VS1 physical gameplay NOT TESTED. **Next:** follow owner checklist feedback, then continue approved P2/VS1 engineering.


**2026-10-24 next VS1 bridge proof (TEST ONLY):** Added per-owner Node-to-native *fake* sink adapter exclusively under `scripts/lib`, hooked optional child-liveness fault notification into the paired WebSocket hub, and Windows CI test for PIN/origin/one-owner → native state, independent native timeout, phone socket drop, and synthetic process kill. No runtime production factory injected; ordinary `/gamepad` stays 503 with no approved driver. Prior commit [`ef657a5`](https://github.com/Farzansayeed/WinDock/commit/ef657a5afa5265994fd3b2b832be6cacad5398ce) passed [CI #40108234730](https://github.com/Farzansayeed/WinDock/actions/runs/40108234730), [preview workflow #40108234505](https://github.com/Farzansayeed/WinDock/actions/runs/40108234505), and published [Preview v21](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.21-gef657a5). **New-commit CI not run at commit time**, local .NET/physical devices NOT RUN; no Xbox/XInput device, phone networking or real driver fail-neutral verified. Next P2 approved hardware validation and safe native backend; then Android Kotlin socket integration.


**2026-10-24 isolated native IPC milestone (FAKE SINK ONLY):** New `native/gamepad-sidecar` persistent .NET 8 stdin/stdout process reuses strict v1 parser and independent 180-ms native fail-neutral watchdog, enforces 256-byte bounded frame reads, exits on EOF/invalid/idle; test-only flag refuses unsupported production startup. Windows CI now builds it and tests fake sink press/replay/timeout/malformed/EOF/oversize. **No signed virtual Xbox driver, Android-to-PC control, gameplay, or prod sink.** Baseline source [d719b826](https://github.com/Farzansayeed/WinDock/commit/d719b826a38113c49f81836f9aa50883aac6f3fa) [CI #40017943222](https://github.com/Farzansayeed/WinDock/actions/runs/40017943222) passed; highest published numeric [Preview v20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083). **New commit CI PENDING** at commit time ([CI runs](https://github.com/Farzansayeed/WinDock/actions/workflows/ci.yml)); local .NET and physical Windows/Android tests NOT RUN. **Next:** parent process supervision and pairing-to-sidecar test boundary; after informed P2 backend consent, real signed/reversible offline XInput lab test.\n\n
**NEXT SESSION (2026-10-24):** [NEXT-SESSION.md](NEXT-SESSION.md) is the current frozen handoff, verified Preview [v20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083), P2 signed/offline Xbox driver blocked, P3/P4/P5 driver-neutral CI done, live PC gamepad NOT functional. **Spotify still fails from WinDock and user has deferred Spotify/DDC/dot issues**. Historical notes below may be older; do not mistake v5/v11/v16 for latest.

**Canonical source of truth for status:** this document, on the `feature/universal-gamepad` branch of [Farzansayeed/WinDock](https://github.com/Farzansayeed/WinDock/tree/feature/universal-gamepad).  
**Last reviewed:** 2026-10-24 (closing handoff).  
**Universal desktop launcher Preview v16 verified (2026-10-24):** [WinDock Gamepad Preview 0.2.3-gamepad.16](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.16-gf8d8a0e) is published and non-draft from source commit `f8d8a0e`; [Windows+Android release workflow #40011693658](https://github.com/Farzansayeed/WinDock/actions/runs/40011693658) **PASSED** Windows native helper build, installer installation/upgrade/uninstall smoke, Android APK/unit/lint+permanent keystore signer validation, and release publication. [CI #40011693770](https://github.com/Farzansayeed/WinDock/actions/runs/40011693770) passed Linux, macOS, Windows and aggregate. Both Windows/Android packages, BUILD-INFO.txt, SHA256SUMS.txt and PUBLIC SIGNING-INFO.txt are present. **Actual user's WinDock Spotify/window focus, other app and running dot, DDC/CI, and Android in-place upgrade remain UNTESTED on physical devices**; never claim universal resolution solely on CI.

**Universal Win32 launch repair 2026-10-24:** Implemented native exact executable-path + top-level-window lookup, focus/restore on existing classic app rather than spawning another process, preserved shortcut arguments, safety tests and correctly detached input thread. Windows build/CI and public Preview v16 PASSED; physical user tests PENDING. **No Spotify hardcoding**. See WORKLOG.

**Spotify install type confirmed 2026-10-24:** User's Get-StartApps points to Roaming Spotify.exe, Get-AppxPackage Spotify is empty and file exists. **Classic Win32 app, not Store/MSIX.** The v13 COM change is unrelated. New source fix avoids blocking launch HTTP reply on a slow Windows running-process scan; CI and PC launch verification pending. See WORKLOG.

**Spotify investigation 2026-10-23:** Store-packaged Spotify vs Win32 Spotify.exe routes differ. Windows COM activation code plus actionable errors implemented for packaged apps. CI and physical Windows Spotify proof pending; installed Spotify type still unknown.

**2026-10-23 regression remediation:** A user reported external app-status dots not changing, app launch acknowledgement without visible app, and DDC brightness failure. **Source fix committed**: bounded socket running-state polling, honest launch request wording/refresh, and high-level-to-VCP DDC brightness fallback. **GitHub CI and release packages PASSED for v12; physical host/monitor results still pending.** These are cross-feature WinDock functionality fixes, not verified gamepad input. See WORKLOG and [SESSION-HANDOFF.md](SESSION-HANDOFF.md).

**Current phase:** **P2 signed Xbox virtual-device feasibility BLOCKED pending approved physical/driver test; P3 Android stick+A plus frame codec DONE in source/CI (not network-wired); P4 real native independent watchdog and P5 paired WS lab transport DONE in source/CI (no device sink or Android wiring). P7 experimental v20 signed preview built and published; physical update/gameplay gates OPEN.**
**Next concrete task:** Obtain safe Windows 10/11 version/architecture and read-only XInput baseline on a test PC; evaluate one **explicitly approved** signed, redistributable, offline-compatible XInput backend in an isolated, rollback-capable environment. Then connect Android native stick+A via the now-tested paired /gamepad transport to persistent native receiver and real device; hardware-test fail-neutral and VS1. Preserve Touchpad/Signature; P8 tuning deferred; Spotify/app launching deferred by owner.
**Gamepad roadmap development milestone (2026-10-24):** [Gamepad Preview v0.2.3-gamepad.20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083) from source commit `c138083` was verified **non-draft/published** with Android Preview APK, Windows Preview installer, SHA256SUMS.txt, BUILD-INFO.txt and public SIGNING-INFO.txt. [Preview workflow #40015513571](https://github.com/Farzansayeed/WinDock/actions/runs/40015513571) passed Android unit/lint/APK/permanent signer, Windows installer smoke and publishing; [feature-branch multi-OS CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520) passed. It includes authenticated driver-neutral single-owner /gamepad WebSocket + strict state/replay/timeout checks, native .NET 8 independent real-timer fail-neutral fake report sink, and new Kotlin v1 stick+A full-state codec/JVM tests. **Production /gamepad upgrade intentionally returns 503 without real Xbox device backend; Gamepad remains local-only on Android, NOT usable in Windows games.** Real signed device + end-to-end hardware acceptance required.

**Important status disclaimer:** Native Android **local** stick+A input preview and unit tests exist; Android-to-Windows gamepad transport, real virtual XInput driver and measured latency **are not implemented or verified**. Do not conflate update signing success with a working PC gamepad.

**Driver-feasibility test plan:** [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md), research only; no Windows virtual Xbox driver selected or installed. GitHub Actions are **enabled and passing**, including the v11 stable-signing preview build above.

**Audit / risk gate:** [AUDIT.md](AUDIT.md) — 12 audited risks; A1/A2 (Windows virtual device) and A8 (neutral safety) are critical. Driver integration and app-to-game feasibility unproven. Follow audit execution gates; it supersedes phase ordering where inconsistent.

**Packaging issue to monitor:** The 0.2.3-gamepad.3 run ([39989554161](https://github.com/Farzansayeed/WinDock/actions/runs/39989554161)) had passing Windows/Android jobs but its GitHub release creation was refused with HTTP 403 `Resource not accessible by integration`. A retry of failed publishing was requested; no newer release should be claimed without checking its result. Build artifacts remain in Actions even when release publication fails. Separately, JS and .NET protocol multi-platform CI passed. **Historical v5 native-preview build:** [0.2.3-gamepad.5](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.5-g0a81c22) from native-input commit `0a81c22`. [GitHub preview workflow #39991422753](https://github.com/Farzansayeed/WinDock/actions/runs/39991422753) **success**: Android APK/JVM tests/lint, Windows installer/native tests, installer smoke and GitHub publish; [general CI #39991422757](https://github.com/Farzansayeed/WinDock/actions/runs/39991422757) **success**. Packages have SHA256SUMS and BUILD-INFO. **No real-device touch/controller test or actual gamepad PC connection.**

**Historical (superseded) preview release:** [0.2.3-gamepad.2](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.2-gd8663f6) from commit `d8663f6`; GitHub [build #39988429549](https://github.com/Farzansayeed/WinDock/actions/runs/39988429549) and [CI #39988429632](https://github.com/Farzansayeed/WinDock/actions/runs/39988429632) both succeeded. Newer JS state-protocol commit `7caf907d` passed [general CI #39989554258](https://github.com/Farzansayeed/WinDock/actions/runs/39989554258). **The .NET parser commit `d66074ce` passed [multi-platform CI #39989884526](https://github.com/Farzansayeed/WinDock/actions/runs/39989884526); its separately numbered installer/APK prerelease is not confirmed published yet.**

**Latest updater test evidence (2026-10-23):** [CI run #39994885297](https://github.com/Farzansayeed/WinDock/actions/runs/39994885297) **passed Windows, Linux, macOS and overall CI** for commit `0deb4b84`, including Windows update fixture tests. Earlier signing-enabled commit `440a12fb` passed [CI #39994402883](https://github.com/Farzansayeed/WinDock/actions/runs/39994402883) and its Android APK/unit/lint build job, but **final release publication was still pending at check time**. Do not claim a new installer/APK has been released or a physical upgrade has been tested.

**New fork-only consented updater:** [UPDATES.md](UPDATES.md) describes Windows Preview tray and Android Preview Phone options check → consent → release SHA-256 verified download → OS installer consent; source committed, CI/real-device upgrades pending. Owner reported four signing secrets added and [preview CI #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) **confirmed** APK signer matches private keystore. Published v11 carries SIGNING-INFO.txt. **Physical update still pending**. Do not claim fully automatic/silent updates.

**Permanent signing verified on 2026-10-23:** The owner reported configuring all four private signing secrets, and the [Gamepad Preview build #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) **passed**: Android's "Require and load dedicated stable Android preview signing key", "Build numbered APK, unit tests and lint", and "Confirm APK was signed by the permanent preview key" all succeeded; Windows build/installer smoke and prerelease publishing also succeeded. **[Gamepad Preview 0.2.3-gamepad.11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e)** from commit `175942e` is published with both installers, SHA256SUMS.txt, BUILD-INFO.txt, and **SIGNING-INFO.txt**, which contains only the PUBLIC signer-certificate fingerprint. [Multi-platform CI #39998130774](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) also passed. **First in-place upgrade on physical Android phone not yet tested**; existing ephemeral-debug APK may require one-time uninstall of ONLY the Preview app.

**Preview installation and release automation:** [INSTALL-PREVIEW.md](INSTALL-PREVIEW.md). **First successful Gamepad Preview 0.2.3-gamepad.1 published** as a prerelease: [Windows + Android downloads](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.1-gc631611). [Build workflow run 39988106341](https://github.com/Farzansayeed/WinDock/actions/runs/39988106341) and [CI run 39988106319](https://github.com/Farzansayeed/WinDock/actions/runs/39988106319) completed **success** for commit `c631611`; includes Windows installer smoke and Android unit/lint/APK. **No real-phone/manual install performed**; newer versions must be verified separately.

**New research:** [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md) compares six phone-controller projects, licensing, security flags and architecture integration. **Deferred P8:** [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md) is queued strictly **after Gamepad v1/P7** and is NOT part of the current work.

For requirements, read [START HERE](00-START-HERE.md), [actual UI screenshots](UI-REFERENCE.md), [UX flow](01-UX-NAVIGATION.md), and [full technical brief](REQUIREMENTS-v2.md). See [WORKLOG](WORKLOG.md) for chronological changes.

**MANDATORY new-chat context:** [SESSION-HANDOFF.md](SESSION-HANDOFF.md) (latest verified v20 code/release milestone, blockers, source map, tests, what to do next). Future sessions must read root AGENTS.md and preserve this tracker/worklog in the same code commit.

## Status key

- `[x]` **Done** = committed and reviewed/verified as stated (include test evidence when applicable).
- `[ ]` **Not done** = not implemented, not yet verified, or blocked.
- Mark **IN PROGRESS** or **BLOCKED** explicitly beside the phase title; do not confuse planned work with shipped features.
- "UI preview complete" must **not** be described as "controller works in games."

## At-a-glance

| Phase | Outcome | Status | Evidence / gate |
|---|---|---|---|
| P0 | Fork + preserved requirements + actual current-UI screenshots + continuity instructions | **DONE** | Source and docs committed; see [UI reference](UI-REFERENCE.md) |
| P1 | Gamepad inside Touch & sign, quick Touchpad return | **SOURCE/CI TESTS PASSED; REAL PHONE UX PENDING** | Regression and physical input navigation still need hands-on test |
| P2 | Windows virtual Xbox controller backend feasibility and license decision | **READ-ONLY PROBE ADDED; DRIVER PROOF PENDING** | Driver comparison, native proof-of-concept, install/uninstall verification |
| P3 | Native Kotlin phone gamepad controls/editor | **LOCAL STICK+A + SHARED V1 FULL-STATE KOTLIN ENCODER CODED; NETWORK + EDITOR PENDING** | Real-device gestures and full control groups still open |
| P4 | Native Windows persistent receiver, virtual state mapping, neutral watchdog | **NATIVE .NET 8 INDEPENDENT TIMER FAIL-NEUTRAL OUTPUT OWNER ADDED; ACTUAL DEVICE/IPC NOT WIRED** | Windows tests and `joy.cpl` hardware verification |
| P5 | Secure paired control plane + reliable gamepad transport; Wi-Fi and USB tether | **AUTHENTICATED SINGLE-OWNER DRIVER-NEUTRAL /gamepad WS LAB CHANNEL CODED; NO PRODUCTION SINK OR ANDROID WIRING** | Auth/replay/loss/reconnect tests + measured transport comparison |
| P6 | End-to-end game compatibility, input correctness, latency benchmarking | **NOT STARTED** | Real Android + PC; p50/p95/p99; regressions |
| P7 | Versioned preview packages, self-update and stable signing | **SIGNED V20 VERIFIED & PUBLISHED; REAL PHONE/PC UPGRADES UNTESTED** | v20 CI and signing checks passed; stable playable controller not ready |
| P8 | Improve existing Touchpad latency **after finished Gamepad v1** | **DEFERRED — AFTER P7** | Baseline/measured improvements, existing gesture regression tests |

**Progress accounting:** **P0 complete; P1 code committed pending testing; P2–P7 not complete; P8 Touchpad latency is deferred until Gamepad v1/P7.** No percentage estimate from phase count. Plan audit documented in [AUDIT.md](AUDIT.md) on 2026-10-23 (documentation-only). This is not a percent-of-development estimate. No Windows/Android end-to-end gamepad testing has been run.

## P0 — Repo setup, requirements and UI capture — DONE

- [x] User fork created at `Farzansayeed/WinDock`; source still attributed to upstream `aliihsaad/WinDock`.
- [x] Work branch `feature/universal-gamepad` exists, leaving fork `main` unchanged.
- [x] User constraints documented: 0/1/2 sticks; D-pad; ABXY; LB/RB; LT/RT; Menu/View; local drag/resize profiles.
- [x] Agreed navigation: Gamepad is **inside** existing **Touch & sign**, with direct Touchpad ↔ Gamepad switch.
- [x] Actual Signature, dashboard drawer, Touchpad UI screenshots committed as [WebP contact sheet](assets/current-ui-screenshots.webp), explained in [UI-REFERENCE.md](UI-REFERENCE.md).
- [x] Native Kotlin ↔ native Windows low-latency architecture proposals documented.
- [x] Out-of-scope choices recorded: **no haptics; no gyroscope in initial release**.
- [x] Created this progress tracker and [WORKLOG](WORKLOG.md).
- [ ] No implementation tasks or native tests are included in P0; see P1–P7.

## P1 — Navigation and UI-only preview — SOURCE/CI PASS; MANUAL UX GATE OPEN

**Goal:** one-tap navigation between fullscreen Touchpad and Gamepad while staying inside the existing Touch & sign experience; Signature continues working. **No fake controller connectivity.**

- [x] Add third `Gamepad` mode/tab and pane (or equivalent app-controlled launcher) inside `#input-pad` in `public/index.html`. **Source code committed; full P1 gate still pending.**
- [x] Add Gamepad shortcut to bottom-left Touchpad toolbar; leave existing Back/Signature/Keyboard controls. **Source code committed; full P1 gate still pending.**
- [x] Offer a prominent one-tap **Back to Touchpad** action from Gamepad without returning to dashboard. **Source code committed; full P1 gate still pending.**
- [ ] Update `public/input-pad.js` mode selection/state teardown safely, preserving existing touchpad release and signature drawing. **Source implementation present; manual regression validation still pending.**
- [x] Add responsive gamepad preview styles to `public/style.css` matching navy/charcoal grid, subtle glass and blue accents. **Source code committed; full P1 gate still pending.**
- [x] Show accurate capability/preview labels: **UI preview, not yet controlling PC games**; no misleading `Connected controller` state. **Source code committed; full P1 gate still pending.**
- [x] Add regression tests for mode switching and existing `Touchpad`/`Signature` behavior, update existing verification tests as appropriate. **Persistent mode-switch tests added as `scripts/verify-gamepad-ui.mjs` and registered in `test/run.mjs`, plus static `verify-pwa.mjs` assertions.**
- [x] GitHub feature-branch CI/npm tests and Android preview build/lint passed (for v11: [Actions](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) and [CI](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774)); mocked mode-switch tests also passed. **Manual phone/WebView regression remains untested**.
- [ ] Manually verify Touchpad → Gamepad → Touchpad, Signature switching, Touchpad release, responsive layout and WebView behavior on a real Android phone.
- [x] Update the PWA service-worker cache key to prevent old input UI from persisting after an update.
- [x] Enable existing CI on pushes to `feature/universal-gamepad` (runs when GitHub Actions is enabled for this fork).

**Exit gate:** navigation flows work without dashboard detours, regressions are addressed, tests/results recorded in WORKLOG. **Code is implemented, but this gate remains open until CI and real UI checks pass. P1 does not mean usable gamepad input.**

## VS1 — Minimum playable end-to-end proof (NEW mandatory integration gate; after P2, before polished editor) — NOT STARTED

- [ ] Demonstrate **one native Android analog stick and one A button** controlling a real Windows virtual Xbox/XInput-visible device.
- [ ] For baseline, reuse authenticated WinDock connection with persistent WebSocket/helper before introducing UDP.
- [ ] Show immediate release and bounded PC watchdog on exit, app background, disconnect, stale packets, and process failure.
- [ ] Validate in Windows controller tooling and a supported PC game/test application; record result, hardware/version and limitations.
- [ ] **Only then** expand the full editor and begin UDP optimization, if measurements justify it.

**Exit gate:** one genuine phone→PC→virtual controller path works safely. Visual demo or synthetic-only frames do not pass.

## P2 — Windows virtual device feasibility — INSTRUMENTATION ADDED, DRIVER PROOF NOT STARTED

See [P2-DRIVER-FEASIBILITY.md](P2-DRIVER-FEASIBILITY.md) for individual backend tradeoffs, safe install/rollback, XInput tests and go/no-go evidence requirements.

- [x] Research current HIDMaestro/libvirtualhid/ViGEmBus candidate documentation and record .NET 10/admin/certificate trust, production signing vs machine licence/cloud validation, supported Windows versions and uninstall/recovery risks (read docs only; physical verification NOT done).
- [ ] Choose/obtain explicit approval for an independently tested, signed, redistributable Windows virtual Xbox backend consistent with fully local runtime; no candidate approved as of 2026-10-24.
- [ ] Build isolated native C# proof of concept for creating/removing a virtual controller; no gamepad network plumbing required yet. Compare HIDMaestro (.NET 10/admin + local cert) with existing WinDock .NET 8, licensed libvirtualhid, and retired ViGEmBus. **Never bypass driver signature enforcement.**
- [ ] Validate clean install, elevation/UAC lifecycle, machine certificate trust, signature legitimacy, Windows 10/11 support, and reversible uninstall; choose safe way to isolate administrative work.
- [x] Add a no-install, read-only XInput slot inspector in `native/gamepad-probe/` to support real Windows testing. **Source added, compilation/Windows execution pending.**
- [x] Read-only .NET 8 XInput diagnostic build/help passed Windows GitHub CI; static source checks passed. **Real device/driver scan on owner's Windows PC is still pending**.
- [ ] Record a before/after XInput slot scan and changed A/axes against a separately approved virtual driver on real Windows.
- [ ] Verify recognized controller axes/buttons in Windows `joy.cpl` or equivalent.
- [ ] Record chosen driver + reasons in `docs/gamepad/`, including caveats; confirm any admin/install requirements.
- [ ] Prove neutral + destroy behavior and crash recovery on a real Windows PC.

**Exit gate:** a legal/deployable virtual controller backend works locally; if not, mark P2 **BLOCKED** and do not pretend generic keyboard emulation is equivalent.

## P3 — Native Kotlin UI, input and profiles — ONE-STICK+A NATIVE UI CODED, TEST GATE PENDING

- [x] Add **native GamepadTouchView overlay** using the existing trusted Kotlin WebView bridge (zero-argument call, trusted endpoint guard), with direct Touchpad return through an explicit UI event. Source committed; device validation outstanding.
- [ ] Support individual pointer-ID multitouch: independent 0/1/2 sticks, D-pad, ABXY, LB/RB, LT/RT, Menu/View.
- [ ] Support one-stick mapping to logical left **or** right stick and true analog positions (not WASD), deadzones and Y inversion. **Initial local test uses fixed logical left stick (signed continuous values, 6% deadzone), no selectable right role yet.**
- [ ] Implement Edit Layout: drag/resize/toggle groups, safe regions; gameplay inputs neutral while editing.
- [ ] Implement local presets Full / Single Stick / Racing / Minimal / Custom, persisted per phone; profile changes reset hidden buttons.
- [x] Model handles per-pointer release and ACTION_CANCEL; overlay neutralizes on Android pause, back, failed connection, dispose and return-to-Touchpad. No haptics or gyro. **Android unit/lint CI passed; real-device tests still needed.**
- [ ] Real-thumb ergonomics: fixed/floating joystick center, pointer ownership, screen cutouts, button-size/contrast, accidental exit prevention and responsive landscape layouts.
- [x] Add Kotlin/JVM model unit tests for analog axes, two-finger stick+A, pointer ownership, cancel/release and clamping; Android build/unit/lint CI passed. **Real phone testing still pending**.
- [ ] Android instrumentation and real-device multi-finger usability/orientation tests.

**Exit gate:** native Android screen and gesture/layout state are correct independently of PC games.

**Android P3 serializer foundation (2026-10-24):** Implemented GamepadFrameEncoder.kt with strict ten-field V1 full-state JSON, monotonic session sequence, stick axes, A XInput 0x1000, optional neutral frame; new JVM tests for exact shape, multi-touch source state, cancellation neutral and numeric bounds. **NOT yet connected to a WebSocket or XInput driver.** Android build/JVM/lint passed in v20 preview workflow #40015513571.

## P4 — Windows native receiver and controller state — TIMER-DRIVEN SAFE OUTPUT OWNER CODED, HARDWARE NOT CONNECTED

- [x] Add real .NET 8 timer-driven ControllerReceiver with private controller-sink interface; write neutral at start/lease expiry/invalid input/stop, dispose backend exactly once, refuse replay and never revive closed lease.
- [x] Verify independent PC-side watchdog with a REAL periodic Timer (no further websocket frames) and deterministic mock clock; test initial uninitialized session timeout, malformed/replayed data, native sink cleanup, neutral state.
- [x] Build and test .NET real periodic watchdog Timer and report-sink fake in [Windows CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520); native tests passed. No real XInput driver output.
- [ ] Implement actual persistent native receiver IPC authenticated to the WinDock owner, with native failure handling even if Node process dies. Current fake sink emits NO XInput device.
- [ ] Select a licensed, deployed, signed virtual Xbox backend (P2 proof). Plug backend into IControllerReportSink and verify XInput reports, neutral and crash/restart/uninstall on physical Windows PC.

## P4 — Windows native receiver and controller state — PROTOCOL FOUNDATION ADDED, RECEIVER NOT STARTED

- [ ] Implement persistent native C# gamepad service/receiver and a provider abstraction that does not disturb other OS providers.
- [x] Strict driver-neutral JS/C# v1 gamepad snapshot protocol bounds and parser tests passed GitHub CI. **No live authorized network/driver integration yet**.
- [x] Add driver-independent **JS and C#** fail-neutral session models (replay/drop, timeout and invalid-state release), with dual-language test suites wired into npm and Windows CI. **Multi-platform CI passed for `d66074ce`; neither model is wired to production network or virtual device.**
- [ ] Map all analog/digital signals into virtual Xbox-compatible reports; support simultaneous buttons and analog trigger values.
- [ ] Test bounded rate, validation and ordering; no process spawning per touch/update.
- [ ] Implement production owner lease, neutral on stop, timer-driven Windows native staleness watchdog and driver-exit/crash cleanup. **The JS state gate is a model only, not a device-level watchdog.**
- [ ] Windows helper tests and manual driver/controller inspection.

**Exit gate:** PC can apply validated synthetic test frames to the virtual controller safely.

## P5 — Android ↔ PC pairing and low-latency transport — SECURE LAB CHANNEL IMPLEMENTED, HARDWARE NOT CONNECTED

- [x] Add /gamepad WebSocket endpoint guarded by existing WinDock paired session and same-origin authorization; reject host without actual backend sink (HTTP 503). Fixed previously broad dock-sync WebSocket upgrader so only '/' is owned by dock, '/input' by touchpad and '/gamepad' by gamepad. Initial duplicate-upgrade CI failure corrected; v20 CI passed.
- [x] Single owner/session lease; reject simultaneous phone owners; revalidate authorization; bounded 256-byte full-state frames, sequence replay protection, 180ms timer expiry, invalid/binary/overrate/disconnect neutralization, sink cleanup.
- [x] Real WebSocket integration tests pass on [multi-OS CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520) (authenticated ownership, 503 without sink, replay, invalid/rate/timeouts, disconnect neutral). No XInput output.
- [ ] Wire native Kotlin stick+A to authenticated local WinDock /gamepad socket, with correct touch/Back/background/lost pairing neutral.
- [ ] Implement a real Windows adapter/native receiver with its OWN timer-based watchdog and proven legally deployable signed virtual XInput driver (P2).
- [ ] Measure Wi-Fi/USB tether latency and recoverability; later compare secure UDP only if measured improvements justify it.

## P5 — Android ↔ PC pairing and low-latency transport — NOT STARTED

- [ ] Reuse authorized WinDock PC pairing without leaking PIN/cookie/secrets to untrusted WebView pages.
- [ ] Add version/capability negotiation, bounded one-owner session start/stop, connect/reconnect state.
- [ ] First implement/measure persistent-helper authenticated WebSocket as the minimum viable baseline; **prototype native UDP only if benchmark results show a worthwhile improvement** over complexity/security cost.
- [ ] Full-state versioned protocol with sequence/epoch, freshness, malformed/replay protection, proper auth/key handling and explicit existing-LAN-HTTP threat caveat.
- [ ] Send immediate button edges and latest analog state; no stale queue buildup; watchdog on loss/disconnect.
- [ ] Validate on Wi-Fi and USB tethering without ADB requirement.

**Exit gate:** a paired native Android phone successfully drives a verified PC controller over supported local links, with safe disconnect.

## P6 — Performance and compatibility — NOT STARTED

- [ ] Test real games with controller support, Steam detection, Windows `joy.cpl`, all control groups and simultaneous gestures.
- [ ] Verify no stuck inputs under dropout, packet reordering, app background, connection loss, battery saving and fast mode switches.
- [ ] Record measured processing latency p50/p95/p99, outlier/jitter, connection type, device/OS specs, sample size, method and measurement scope.
- [ ] Compare native UDP vs existing Node/WebSocket route objectively if prototyped; optimize only observed bottlenecks, including touch sampling/display and thermal/battery impact.
- [ ] Define whether metrics represent Android touch event→PC virtual report or real end-to-end game display; avoid cross-device one-way timestamp claims without a clock synchronization strategy.
- [ ] Regression tests for existing Touchpad, Signature, media control, pairing and capture; run relevant `npm test`, Windows and Android suites.

**Exit gate:** evidence of usable gamepad with measured performance; targets are goals, **not achieved claims**.

## P7 — Packaging / handoff — PREVIEW RELEASES AND UPDATER SOURCE, STABLE GATE OPEN

- [x] Set up automated versioned **preview** Windows installer/Android APK workflow on the fork feature branch (release pending successful CI).
- [x] Isolate Windows preview installer name, AppId, install path and dock config; disable upstream update notifications in preview builds.
- [x] Isolate Android preview via applicationId suffix, versionCode and versionName; debug signing limitations documented.
- [x] Document beginner download/install/update instructions in [INSTALL-PREVIEW.md](INSTALL-PREVIEW.md), including hashes and Git commit identity.
- [x] Verify successful GitHub Actions Windows installer + Android APK and published prerelease **for commit `c631611`**, with both platform jobs + publish passing (build 0.2.3-gamepad.1; release assets + checksums verified by GitHub API). [Run](https://github.com/Farzansayeed/WinDock/actions/runs/39988106341) / [release](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.1-gc631611).
- [x] Implement fork-only Windows manual Check for updates, strict release allowlists, verified installer and user-approved setup launch; CI/physical upgrade pending.
- [x] Implement Android Preview Phone options update check, verified APK download, package identity check and Android system installer handoff; CI/physical upgrade pending.
- [x] Add optional stable Android keystore via private GitHub Actions secrets; owner reports secrets added (values not inspected); [CI #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) validated signer identity and published v11 with public fingerprint, but physical upgrade still requires verification.
- [x] Confirm update-enabled preview v11 built and published with Android permanent keystore match, Windows installer smoke, Android unit/lint, and SHA256SUMS + SIGNING-INFO assets ([build #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) / [v11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e)).
- [ ] Test real Android in-place upgrade between *two consecutive* permanent-key APKs; first migration from old ephemeral-debug key may require Preview-only uninstall, and settings preservation is unverified.
- [ ] Test Windows and Android Check for updates manually on actual installed devices and verify failure/decline cases.
- [ ] Real PC/Android vN-to-vN+1 upgrade tests, cancel/failure paths, signature compatibility and configuration preservation.
- [ ] Test installer and APK manually on owner's real PC/phone, validate Wi-Fi/USB pairing, direct mode navigation and update behavior. CI smoke is not physical field testing.
- [ ] Confirm future successful build provenance, versioned assets, rollback and Android signing stability before stable release.
- [ ] Package updated Windows host and Android APK with any lawful driver dependency/install UX and recovery.
- [ ] Verify first install, uninstall, updates, Android/WebView host-version mismatch behavior.
- [ ] Document usage, compatibility limitations and any admin privileges needed; include setup/screenshots and known issues.
- [x] Feature-branch GitHub CI is enabled and passing; [post-v11 docs CI](https://github.com/Farzansayeed/WinDock/actions/runs/39998883980) passed. Distinguish future CI run results from physical device tests.
- [x] User approved continuous VERSIONED DEVELOPMENT PREVIEW prereleases from tested feature-branch code builds; stable promotion and driver redistribution still require independent acceptance/authorization.

**Verified 2026-10-23:** [WinDock Gamepad Preview v0.2.3-gamepad.12](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.12-g2e80adb) from code commit `2e80adb` published successfully: [release build #40002230727](https://github.com/Farzansayeed/WinDock/actions/runs/40002230727) Windows installer build/installer smoke, Android APK build/unit/lint + configured permanent signer verification, and publication all PASSED. [multi-platform CI #40002230776](https://github.com/Farzansayeed/WinDock/actions/runs/40002230776) Windows, Linux, macOS and aggregate PASSED. Both Windows installer and Android APK, BUILD-INFO, SHA256SUMS and SIGNING-INFO assets were verified present via GitHub API. **NO physical owner Windows app launch/DDC monitor, phone running-indicator regression or Windows/Android self-upgrade was tested.**

**Verified Preview v13 (2026-10-23):** [WinDock Gamepad Preview 0.2.3-gamepad.13](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.13-gf164ea0) published **NON-DRAFT** from commit `f164ea0`; [release workflow #40008801028](https://github.com/Farzansayeed/WinDock/actions/runs/40008801028) and [multi-platform CI #40008801048](https://github.com/Farzansayeed/WinDock/actions/runs/40008801048) succeeded. Both Windows/Android installers, SHA256SUMS.txt, BUILD-INFO.txt and PUBLIC SIGNING-INFO.txt are published, Windows installer smoke and Android keystore signature checks passed. **No physical Spotify activation or in-place upgrade has yet been tested.**

## Generic classic Win32 multi-process app activation (2026-10-24)

- [x] Add generic Windows native existing-window detector by full EXE path with nonzero main HWND, handling concurrent background child processes safely.
- [x] Prefer focus of exact matching existing classic app window before Process.Start when shortcut has NO argument/profile; preserve Store/MSIX and argument-bearing shortcut routes.
- [x] Unify WinDock existing PID focus and native fast-path focus, with proper temporary foreground thread attachment cleanup.
- [x] Add source regression tests ensuring exact path and real window matching, no app-name hardcoding and safe profile behavior; CI and field tests still pending.
- [x] Windows native helper compilation, npm tests, full CI and published [Preview v16](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.16-gf8d8a0e) all passed ([release workflow](https://github.com/Farzansayeed/WinDock/actions/runs/40011693658), [CI](https://github.com/Farzansayeed/WinDock/actions/runs/40011693770)).
- [ ] Owner verifies Spotify and other classic apps launch/focus correctly from phone and dots reflect real windows, including multi-process closed/open and other EXE paths. No silent elevation or background process killing.

## Spotify Windows launch: packaged app activation

- [x] Replace packaged-app ShellExecute AUMID launch with documented Windows COM IApplicationActivationManager plus HRESULT/process ID check; Win32 EXE route unchanged.
- [x] Report sanitized HTTP 502 on packaged activation failure, rather than false successful launch.
- [x] Verify Windows helper COM build/CI and published [Preview v13](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.13-gf164ea0), passing [Actions #40008801028](https://github.com/Farzansayeed/WinDock/actions/runs/40008801028) and [CI #40008801048](https://github.com/Farzansayeed/WinDock/actions/runs/40008801048).
- [x] Identify user's Spotify installation as classic unpackaged Win32 Spotify.exe via direct PowerShell Get-StartApps/Get-AppxPackage/Test-Path results. Whether Start actually opens it remains UNKNOWN.
- [x] Make launch/focus/close HTTP acknowledgements non-blocking on slow post-action Windows process inventory; add a paired-WebSocket delayed-scan integration regression (code committed, CI pending).
- [ ] Confirm Windows Start and direct PowerShell Spotify.exe launch actually create a visible window; compare with phone tile target and arguments.
- [ ] Verify new non-blocking launch CI and publication of correct matching preview.
- [ ] Test real Spotify tile on user's Windows + phone, including visible window and running dot; don't claim fixed on CI alone.

## Existing WinDock app-launch, running-indicator and brightness regression checks (2026-10-23)

- [x] Audit running-window refresh: pre-fix WebSocket broadcasts only covered explicit WinDock changes. Add a bounded live running-state poll for paired clients, avoid duplicate unchanged frames and clean up on server close (source + integration test).
- [x] Replace unverified "Opened:..." toast with "Launch requested:..." and refresh after launch; do not confuse request acknowledgement with an opened Windows window.
- [x] Retry DDC/CI VCP 0x10 brightness writes if a monitor reports high-level brightness but refuses SetMonitorBrightness; hardware dependent, no workaround for disabled or unsupported DDC/CI.
- [x] Confirm post-fix npm/sync and Windows C# CI and newly released Preview v12 packages (both platforms and signing checks passed): [Actions build #40002230727](https://github.com/Farzansayeed/WinDock/actions/runs/40002230727), [CI #40002230776](https://github.com/Farzansayeed/WinDock/actions/runs/40002230776), [v12 download](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.12-g2e80adb).
- [ ] Real Windows host/Android phone: close/start apps outside WinDock; dots should change within a few seconds and launch/foreground requests should create visible windows. If not, collect exact app name, whether manual Windows launch works, installed Preview version, and non-sensitive PC log.
- [ ] Real monitor: check DDC/CI enabled via OSD, HDR/picture presets, connection and support for monitor brightness; run read-only brightness diagnostics, change/restore once, record model and outcome.
- [ ] Avoid claiming all three issues fully fixed until the user verifies the actual Windows environment.

## P8 — Touchpad latency optimization — DEFERRED UNTIL AFTER GAMEPAD V1

- [x] User's requested post-gamepad Touchpad performance work recorded without changing P1–P7 scope.
- [x] Existing Touchpad pipeline identified and candidate bottlenecks documented in [TOUCHPAD-LATENCY-P8.md](TOUCHPAD-LATENCY-P8.md).
- [ ] **After P7**, take real Touchpad latency baseline on Android+Windows (Wi-Fi and USB tether).
- [ ] Only then evaluate WebView touch sampling, `requestAnimationFrame` coalescing, WebSocket/Node, persistent native helper and optional native transport based on measurements.
- [ ] Implement and test improvements without breaking tap/scroll/pinch/drag, Signature or keyboard; record before/after evidence.

**Do not start P8 during gamepad feature construction, and do not assume gamepad UDP semantics apply to relative mouse deltas.**

## Research completed — documentation, NOT integration

- [x] Verified six open-source phone gamepad repositories and adjacent receiver/security documents; documented license and implementation caveats in [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md).
- [x] Extracted concrete WinDock integration recommendations, benchmark methodology and red flags (not copied source code).
- [ ] No candidate virtual driver or external mobile project has been integrated or physical-tested into WinDock as a result of this research.

## Explicitly deferred or excluded

- Gyroscope: **future optional exploration after P6 and user approval**, not a v1 backlog obligation.
- Haptics, rumble, vibration, adaptive triggers: **excluded**, not merely pending.
- Native PlayStation DS4/DualSense device emulation: **deferred**; PlayStation button skin/labels don't create a PS device.
- Linux virtual gamepad: later separate task; preserve existing Linux input.
- Cloud sync, remote internet relay, accounts, telemetry: excluded.

## Audit-required decisions (not yet made)

- [ ] D1 Virtual controller driver functional, licensed/distributable and Windows version compatibility demonstrated.
- [ ] D2 .NET/runtime/elevation/certificate/install/removal approach decided safely.
- [ ] D3 Native Activity/WebView return and pairing session lifecycle verified.
- [ ] D4 VS1 true phone→gamepad minimal playable path passes with neutral watchdog.
- [ ] D5 Connection transport benchmarked; UDP remains optional until evidence.
- [ ] D6 Physical UX, compatibility and latency measurement definitions recorded.

See [AUDIT.md](AUDIT.md) for the full risk register and sources.

## Documentation/update contract — mandatory for future work sessions

**Cross-repository research handling:** [OPEN-SOURCE-RESEARCH.md](OPEN-SOURCE-RESEARCH.md) is the reference baseline. When integrating third-party ideas, record source/license attribution and driver/security decisions. Do not copy GPL app code into MIT WinDock without license review. **Keep P8 queued until Gamepad P7 completes**; update its checklist and worklog only when explicitly doing that later work.

**Every meaningful implementation batch/commit must update the docs in the SAME commit as the code whenever feasible:**

1. Read `docs/gamepad/00-START-HERE.md`, this tracker, [AUDIT.md](AUDIT.md), screenshot reference and most recent WORKLOG entry before editing.
2. After a batch, mark completed checklist items **only** when implemented and verified; leave unverified items unchecked and record blockers/unknowns.
3. Update `Current phase`, `Next concrete task`, the at-a-glance status and task checkboxes here.
4. Append to `WORKLOG.md`: date, commit/hash or branch, what changed, tests run and results (or "not run"), blockers, next action.
5. Update `00-START-HERE.md`, `UI-REFERENCE.md`, architecture specs and screenshots if decisions, actual UI or implementation paths changed.
6. Don't claim tests ran, measurements exist, drivers work, or releases were produced unless evidenced.
7. Commit progress/docs alongside implementation and link useful code/tests. If a session only updates docs, log it as documentation-only.
8. Work only on the owner's fork/feature branch, not the upstream project. Never commit secrets or pairing data.

**Note:** The documents don't update on their own when nobody is working on the repository. Future ChatGPT/Codex sessions should follow this contract whenever they make changes.
