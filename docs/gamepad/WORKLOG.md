# WinDock Gamepad — chronological worklog

**Canonical tracker:** [PROGRESS.md](PROGRESS.md)  
**Location:** `Farzansayeed/WinDock`, branch `feature/universal-gamepad`.  
**Rules:** newest entries at top; don't fabricate passing checks or completion; document actual code/test/decision evidence each work session. Every code batch should update this file and PROGRESS.md in the same commit. Do not log pairing secrets/device-specific private data.

---

## 2026-10-25 — Verified v46 native teardown quarantine and documentation handoff

**2026-10-25 V46 VERIFIED VS1 OWNER-SAFETY HANDOFF:** Source [72afe3b](https://github.com/Farzansayeed/WinDock/commit/72afe3bfce9f89c13a1d2cc015a89a845bad7701), [CI #40184905357](https://github.com/Farzansayeed/WinDock/actions/runs/40184905357) SUCCESS Windows/Linux/macOS, [Preview pipeline #40184905439](https://github.com/Farzansayeed/WinDock/actions/runs/40184905439) SUCCESS. [Non-draft Gamepad Preview v46](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.46-g72afe3b) published with Windows, Android, probes, checksums and signing info. In driver-neutral lab-only authenticated WebSocket hub, native sink close throw/rejection/missing cleanup now permanently quarantines this hub until restart (HTTP 503 for new owners); confirmed safe close permits reconnect. New real WS + fake sink test passed all-platform CI; this does NOT prove physical virtual Xbox or Windows driver cleanup. Production gamepad remains HTTP 503; NO driver, vendor file, elevation, certificate trust, licence, or security bypass. Owner v45 Phase A review PASS, prior Windows/Android/v40 audits PASS, do not repeat. No new physical user check for this increment; documentation acceptance review only. Next: driver-neutral Android-to-WS/native protocol and timing/EOF tests. Prior v45 Windows fake-sidecar A-press timing intermittently failed before retry PASS; not claimed fixed.

All-platform CI, including the fake-sink WebSocket containment regression, passed; Preview Windows installer smoke, Android packaging, and publication passed. The production driver remains absent. No owner hardware checks added; physical device cleanup is unverified.

---

## 2026-10-25 — Contain uncertain native close; one-owner transport fail-closed

**2026-10-25 V45 OWNER ACCEPTED PHASE A → VS1 FAIL-NEUTRAL SESSION CONTAINMENT (DRIVER-NEUTRAL):** Owner explicitly marked v45 Phase A decision review PASS, notes `none`, and authorized next driver-neutral real-gamepad transport/fail-neutral robustness; NO vendor binaries, installation, elevation, certificate trust, security bypass or purchases. Starting source [`b92e1e2`](https://github.com/Farzansayeed/WinDock/commit/b92e1e2ee93571296310cc8a752cf2fab34fc033), [Preview v45](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.45-gb92e1e2) SUCCESS; [CI #40180599750](https://github.com/Farzansayeed/WinDock/actions/runs/40180599750) SUCCESS on attempt 2 (first Windows fake-sidecar A press timing failed, retry PASS; avoid hiding flake). New driver-neutral hub quarantine latches when native sink close throws/rejects or an initialized sink has no close method; authenticated `/gamepad` subsequent upgrades return HTTP 503 rather than allocating a second device after unproven release. Successful teardown still enables fresh session. Added real authenticated WebSocket + fake in-memory sink regressions for async/sync close errors, missing close, successful replacement, and shutdown; registered in `npm test`. Production `/gamepad` stays 503 by default. No actual XInput backend, physical Xbox/gameplay, Android/Windows owner retest. Both trackers updated atomically with code; new CI/Preview PENDING at commit. Next: verify CI, address test failures without weakening timeouts, continue native watchdog/transport tests.

**Concrete risk:** Previously, `sink.close()` synchronous throw or asynchronous rejection was swallowed and owner cleared, allowing an authenticated second socket to claim the hub while a native device could still be active. Now uncertain close permanently quarantines the process-local gamepad endpoint (HTTP 503), keeping production disabled as before. The initial-neutral and independent timer rules stay unchanged. Only restart following investigation/confirmed device cleanup can reset the latch.

**New automated test:** `verify-gamepad-cleanup-containment.mjs` exercises real PIN auth plus WS ownership against fake sinks with rejecting/throwing close, invalid partial sink, and successful normal reconnect. Fully nonprivileged/no driver. Both trackers and tests included in same commit. New CI/Preview PENDING. The previously observed v45 Windows sidecar timing flake is acknowledged, not yet rewritten or asserted fixed.

---

## 2026-10-25 — Phase A legal/offline/rollback preflight, owner v44 review accepted

**2026-10-25 V44 OWNER PASS → P2 PHASE A DEPLOYMENT DECISION (DOCUMENTARY ONLY):** Owner explicitly marked 1/1 v44 signing and rollback plan review PASS, observations `none`, and authorized only nonprivileged document-only research (no vendor executable acquisition, installation, elevation, trust changes, security bypass or licence purchase). Starting verified [v44 code f862d6b](https://github.com/Farzansayeed/WinDock/commit/f862d6bef5d69a86cceb6c013010c4d83cb952b9), [CI #40179934263](https://github.com/Farzansayeed/WinDock/actions/runs/40179934263) SUCCESS, [Preview #40179934279](https://github.com/Farzansayeed/WinDock/actions/runs/40179934279) SUCCESS. Examined exact vendor tag legal texts without downloading binaries: HIDMaestro v2.0.3 repository LICENSE MIT (bundled third-party notices still unreviewed); local machine self-signed trust and conflicting generic removal doc vs v2.0.3 release warning of USB 3 root-hub filter deletion. libvirtualhid stable and prerelease Windows driver/MSI are LB-SAL (not MIT): §3(b) blocks third-party redistribution absent separate permission; machine licence and conditional online operation block fully local/no-purchase assumptions. ViGEmBus retired. Added P2-PHASE-A-DECISION.md and JSON, pure closed-schema `p2-phase-a-policy.mjs`, CLI, mutation tests wired into npm test, both trackers in one commit. Explicit NO-GO for bundled driver *today*, HIDMaestro research only, all permissions blocked. New code CI/Preview PENDING at writing; physical XInput/gameplay not verified. Preserve owner-passed Windows XInput 0/4, Android v25, v40 audit, v42-v44 document review, no repeat tests.

**Automated gate:** New `scripts/verify-gamepad-phase-a.mjs` validates a closed decision schema and tests attempts to change MIT vs LB-SAL, redistribution blockers, status or permission; new review CLI does no network/driver IO. Existing source-tag release metadata is cross-validated. No actual driver signature or vendor package inspected; release ZIP third-party notices unreviewed. Exact new CI/Preview statuses PENDING when committed.

**Next:** Verify CI/Preview, then request documentation-only owner review of newly confirmed NO-GO judgement. Keep production /gamepad HTTP 503, all physical safety approvals closed.

---

## 2026-10-25 — Owner-approved *nonprivileged* P2 signing and rollback gate plan

**2026-10-25 V43 OWNER PASS → P2 SIGNING/ROLLBACK VERIFICATION PLAN (DRIVER-NEUTRAL):** Owner explicitly marked v43 release-evidence review PASS, observations `none`, chose Proceed ONLY for strictly non-privileged signing/rollback verification planning. No vendor binaries, installer acquisition, driver, elevated permission, certificate-trust change, policy bypass or licence purchase authorized. After validated [source v43 `5d33f4f`](https://github.com/Farzansayeed/WinDock/commit/5d33f4fb0c04a1df176dff1dde572d8f8a9d4937), [all-OS CI #40179149666](https://github.com/Farzansayeed/WinDock/actions/runs/40179149666) and [Preview #40179149812](https://github.com/Farzansayeed/WinDock/actions/runs/40179149812) both SUCCESS, developed a 13-step, 3-phase, fail-closed P2 preflight: (A) public vendor licence/signing/offline/compatibility/shared-driver docs; (B) separately consented vendor-file local hash and authentic MSI/CAT/INF signing review; (C) separately consented privileged device/neutral/rollback test. All NOT_CLEARED; prerelease/retired excluded. New docs/gamepad/P2-SIGNING-ROLLBACK-PLAN.md + machine-readable JSON, pure Node validator, local-only CLI, mutation security oracle registered in npm test; updated PROGRESS and WORKLOG same commit. Exact user X64 Windows physical baseline and v40 audit PASS remain accepted; do not repeat. CI/release verification PENDING at commit time. No installer download, vendor binary execution, signing test, real driver or XInput gameplay.

**Changed:** `docs/gamepad/P2-SIGNING-ROLLBACK-PLAN.md` review, `docs/gamepad/P2-SIGNING-ROLLBACK-GATES.json` with 13 uncleared gates across public evidence / acquisition-with-consent / physical trial-with-consent; `scripts/lib/p2-signing-rollback-plan.mjs` pure evaluator cross-checks the frozen release inventory, refuses forged PASS, missing gates, weakened consent, or disabled exclusions. `scripts/p2-signing-rollback-review.mjs` displays blocker list without network, Windows or driver side effects; `scripts/verify-gamepad-signing-rollback.mjs` added to `npm test`. Vendor documentation and Microsoft driver catalog-signing docs reviewed; actual vendor packages not acquired. Full CI and optional Preview workflow status **PENDING until verified**.

**Next:** Verify exact CI, then owner documentation review only; do not ask any hardware checks. Continue nonprivileged planning if the owner chooses Proceed. A driver trial needs separately informed explicit approval.

---

## 2026-10-25 — Exact vendor release metadata and rollback hazard gate

**2026-10-25 P2 VENDOR EXACT RELEASE + ROLLBACK REVIEW (OWNER APPROVED NON-PRIVILEGED ONLY):** Owner accepted v42 P2 review 1/1 PASS, notes none and explicitly requested next nonprivileged vendor release / rollback assessment, forbidding driver installs, elevation, trust changes, security bypass and purchases. Official GitHub metadata pinned: HIDMaestro v2.0.3 stable x64 ZIP SHA256 b1578a391971f4296026b692844292dfc55ddbddbeabc2bcada8cc36c6e34cd2; libvirtualhid latest stable v2026.914.1218.10 MSI SHA256 bc31539a41f71939c13decb171ccbd4306fae1fed63273434a4f5ceccaf3e71c; newer v2026.1022.2339.24 PRERELEASE MSI b667470b32e3f6e0d66893235693de008ab80863291053dbf89a7532d321ef18; ViGEmBus v1.22.0 retired and GitHub asset SHA256 NOT PROVIDED. HIDMaestro v2.0.3 usbip-win2-inclusive uninstall may restart USB 3 hubs, drop attached devices and defer service deletion to reboot; shared filter ownership unverified. libvirtualhid broker/paid offline validation + LB-SAL and Windows 10 best-effort remain blockers. Added strict offline release metadata catalog, review CLI, mutation-based CI oracle, assessment doc and both trackers atomically. **New CI / Preview PENDING on commit**. Published digest is NOT verified local binary or Authenticode evidence. NO binary download/execution or real Xbox gameplay.

**Scope:** Read-only release metadata frozen at 2026-10-25; code/tests do not fetch or run installers or inspect Windows trust. New CI/PUBLISH not yet verified. Next: verify exact workflows, then present only a risk/consent plan; no driver/privileged user tests.

---

## 2026-10-25 — Correct the pure P2 policy oracle static safety check

**Bug prevention:** The first P2 oracle banned any literal `https:` in policy code, but the validator necessarily validates `https://` source references. Correct the oracle to block Node networking imports rather than legitimate HTTPS address syntax. No IO, installer or approval path added. GitHub CI/Preview PENDING until checked; both trackers updated in the same code commit.

---

## 2026-10-25 — Owner explicitly proceeds with next driver-neutral P2 candidate screen

**Consent boundary:** Owner marked the prior v40 read-only project record review PASS, observations `none`, and explicitly submitted Proceed with the next **driver-neutral** P2 feasibility/development item; expressly forbids drivers, elevation, machine trust/security changes and licence purchases. The old confusion from a prior Report issues message is resolved for this read-only roadmap step ONLY. This is not approval of a driver candidate.

**Starting source:** `feature/universal-gamepad` commit `16775b5323f2c37e3abaed0f1ef0da9aadb72118`, [CI #40177593430](https://github.com/Farzansayeed/WinDock/actions/runs/40177593430) PASSED. Last published Preview v40 source `3ac95c0` remains physically owner-audited. Previously accepted original Windows Preview, XInput baseline 0/4 disconnected, Android v25 and v40 audit remain PASS without retesting.

**Actual development:** Added `docs/gamepad/P2-BACKEND-CANDIDATES.json` source-attributed facts, `scripts/lib/p2-backend-policy.mjs` pure closed-schema validator, `scripts/p2-backend-review.mjs` read-only review CLI, `scripts/verify-gamepad-backend-policy.mjs` fail-closed oracle wired into `test/run.mjs`, and `docs/gamepad/P2-BACKEND-REVIEW.md` with exact vendor/signing/offline/rollback/consent blockers. All three candidates remain BLOCKED_REVIEW_ONLY. A mathematically 'ideal' manifest is also not install authorization; installing drivers can only occur after a separate, outside-repo explicit informed owner permission.

**Tests:** New commit CI/Preview PENDING when written. Tests are pure Node schema/evidence regression; NO driver, Windows device creation, OS trust/policy mutation, browser download or real virtual Xbox/gameplay. CI Windows/Linux/macOS must be checked; no physical owner task newly enabled by this internal safety screen.

**Next:** Review vendor exact version, hash, licence and clean rollback proposals under a distinct later consent gate. Maintain production HTTP 503 for gamepad.

---

## 2026-10-25 — Owner v40 read-only P2 audit evidence received; investigated conflicting issues action

**Repo / source:** `Farzansayeed/WinDock`, `feature/universal-gamepad`. [Preview v40](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.40-g3ac95c0) is sourced from `3ac95c09e09fd13a595d1dbcf39f638c01624de7` and is verified by [CI #40176599482](https://github.com/Farzansayeed/WinDock/actions/runs/40176599482) and [Preview #40176599479](https://github.com/Farzansayeed/WinDock/actions/runs/40176599479). Subsequent docs-only `ba3c7cf3d09c37988183df43ead4f0154d3b4560` [CI #40176981660](https://github.com/Farzansayeed/WinDock/actions/runs/40176981660) succeeded. This entry is an owner evidence checkpoint, no executable code change.

**Owner checks (explicitly reported):** 1. Version-specific v40 x64 SHA-256 match **PASS** (full digest `10218AC0777437A546C0AFE3FF5D362758CFA85CA219773C56E53BF9AE700C2D`). 2. Non-admin read-only `--backend-audit` output with expected safety fields **PASS**. OS version 10.0.26300.0 / OS and process X64; .NET 10 shared-runtime registry `not_detected`; `HIDMaestroTestCert` presence `not_detected` in LocalMachine Root, TrustedPublisher and My; `device_or_driver_installation_performed=no`, `certificate_trust_changed=no`, `controller_created=no`. No installation of any kind was performed by the audit. These `not_detected` values are intended valid result categories, not an audit error.

**Reported-issues discrepancy:** The owner also sent the literal trailing instruction `Not working: investigate unchecked tests and findings before advancing.` despite having selected both item statuses PASS and supplying conclusive output. Investigated: **zero unchecked tests are actually listed**, and no audit/runtime failure appears in the supplied output. Treat it as a request to review before advancing; do not represent the action as an explicit Proceed vote. A docs review acceptance may resolve the contradictory UI submission; no need to repeat physical tests.

**Safety / next:** Physical readiness inventory **2/2 PASS** and old v28 Downloads hash collision resolved via v40 version-specific asset. The P2 **real signed/reversible virtual Xbox driver** and PC game tests remain blocked. No driver install, admin/elevation, machine certificate-trust changes or purchase authorized; no runtime upgrade requested. Owner's old Windows and Android tests remain accepted. Do not proceed to a privileged proof until separately approved.

---

## 2026-10-25 — Verify v40 packaged diagnostic and preserve owner's unchecked audit gate

**2026-10-25 VERIFIED OWNER HASH INCIDENT FIX — v40:** [Code 3ac95c0](https://github.com/Farzansayeed/WinDock/commit/3ac95c09e09fd13a595d1dbcf39f638c01624de7), [all-OS CI #40176599482](https://github.com/Farzansayeed/WinDock/actions/runs/40176599482) SUCCESS and [Preview publish #40176599479](https://github.com/Farzansayeed/WinDock/actions/runs/40176599479) SUCCESS. [Non-draft v40 release](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.40-g3ac95c0) includes unique x64 `WinDockGamepadProbe-v0.2.3-gamepad.40-g3ac95c0-win-x64.exe`, published SHA256 `10218ac0777437a546c0afe3ff5d362758cfa85ca219773c56e53bf9ae700c2d` (same bytes/hash as compatibility alias, proven by CI). Owner's prior `42db320e839f41454b5a7c0867a71447c7dd5b2731eb2e74571818708e742225` matches release v28 x64, NOT v39: stale old Downloads filename, not a verified audit fault. **Owner checksum and `--backend-audit` remain UNCHECKED/NOT RUN.** Use only uniquely named v40 x64 binary after confirming its SHA; run audit only from ordinary PowerShell, no driver/security changes. Earlier Windows/Android and XInput baseline owner checks remain PASS; don't repeat. No privileged/backend approval.

**Verified checks:** All Linux/Windows/macOS CI, Windows installer and read-only x64 portable probe smoke, Android APK and preview release job succeeded. GitHub release contains versioned and legacy x64/ARM64 probe assets and SHA256SUMS. No owner Windows audit has been run; this is documentation only, no code changes. **Next:** Await physical versioned x64 digest/`--backend-audit` report before advancing; driver install, administrator privilege, certificate trust and licence remain separately approval-gated.

---

## 2026-10-25 — Fix wrong downloaded probe version after owner's unchecked audit report

**Branch / commit:** `feature/universal-gamepad`; atomic release-packaging fix and both trackers after verified source/hand-off `9f1ba9a`, [CI #40175405230](https://github.com/Farzansayeed/WinDock/actions/runs/40175405230) SUCCESS, [release #40175405217](https://github.com/Farzansayeed/WinDock/actions/runs/40175405217) SUCCESS, v39 published. New commit CI/publish **pending** at time of commit.

**Owner observed:** The user left checksum and audit both UNCHECKED and supplied SHA256 `42DB320E839F41454B5A7C0867A71447C7DD5B2731EB2E74571818708E742225`, which EXACTLY matches published x64 Gamepad Preview **v28**, not published **v39** (expected SHA256 `A9FCD7236D22868771318CA1991725C52E92B711CA04E9765C53FABD03690048`). The old portable diagnostic occupied the same local Downloads filename. The new `--backend-audit` never ran. This is not a failure of Windows certificate/runtime reading. Physical P2 gate remains unchecked; user provided no approval for drivers/trust.

**Fix:** In CI Preview Windows packaging add both version-and-commit-tagged x64/ARM64 probe names and legacy aliases; explicitly hash-compare both copies per architecture before upload, recheck identical bytes with `cmp` after artifact download; include all four probe names in SHA256SUMS and release assets. Add static safety/oracle tests in `verify-gamepad-probe.mjs`. Improve owner probe/install docs so users choose the new versioned file, hash exactly that file and only then run its read-only audit. Preserve unversioned aliases for existing integrations, no gamepad/driver/auth modifications.

**Automated/hardware:** New CI and preview publish PENDING; do not claim success before workflows finish. No user rerun requested of previously passed Windows Preview setup, Windows XInput 0/4 baseline, Android v25 or ordinary WinDock checks. Next owner check must be fresh and unchecked and cover only the new versioned download checksum + read-only audit, no privilege/security bypass.

---

## 2026-10-25 — Verified read-only P2 audit CI and published Preview v38 (documentation checkpoint)

**Branch/commit:** `feature/universal-gamepad`; code `6141f36`; [CI #40175034190](https://github.com/Farzansayeed/WinDock/actions/runs/40175034190) and [Preview #40175034205](https://github.com/Farzansayeed/WinDock/actions/runs/40175034205) both SUCCESS. Published [Gamepad Preview v38](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.38-g6141f36) is non-draft, exact source `6141f36696fa0ef7e6117336e04c777c3a8ffafe` and contains Windows installer, stable-signed Android Preview APK, x64/ARM64 portable read-only diagnostic EXEs, BUILD-INFO/SIGNING-INFO/SHA256SUMS. Windows CI actually built and ran `--backend-audit` and x64 portable release smoke; ARM64 was only cross-compiled.

**Owner verification pending:** Only new optional read-only Windows x64 `--backend-audit` report, SHA256 compare first, normal nonadmin PowerShell, no install/trust changes. Previous owner's Windows XInput 0/4 scan and WinDock Preview install/start and Android v25 checks still PASS—do not repeat. No real virtual Xbox/PC game tested, no backend approval. See probe README and P2 vendor decision.

**Next:** Collect actual read-only machine audit flags if owner chooses, determine if an isolated HIDMaestro nonproduction rollback trial is acceptable; explain self-signed machine Root/TrustedPublisher and administrator risks and seek **separate explicit approval** before any such operation. Maintain local-only playback and deferred ordinary WinDock issues.

---

## 2026-10-25 — Repair backend audit workflow YAML before job execution

**Branch / commit:** `feature/universal-gamepad`; correction commit after `2eb4f3f`, preserving previous code/tracker changes.

**Observed failure:** [CI #40174892469](https://github.com/Farzansayeed/WinDock/actions/runs/40174892469) and [Preview #40174893194](https://github.com/Farzansayeed/WinDock/actions/runs/40174893194) failed before creating jobs: an unsafe string replacement expanded subsequent workflow source into the new regex field, making YAML invalid. No runner compiled the new C# probe; never characterize these as passing or driver failures.

**Repair:** Reconstructed `.github/workflows/ci.yml` and `.github/workflows/gamepad-preview.yml` from last passing `40b82301`, preserving all previous jobs/installer/signer gates and inserting only bounded read-only `--backend-audit` smoke checks. Checked resulting text lengths and unique anchors. New CI/Preview PENDING until GitHub responds.

**Safety:** Still no driver, certificate changes, administrator action, licence purchase, gameplay or owner physical retest.

---

## 2026-10-25 — Read-only P2 machine audit and current virtual Xbox driver evaluation

**Branch / commit:** \`feature/universal-gamepad\`; atomic code+both trackers after \`40b82301\`, verified baseline multi-platform [CI #40174183156](https://github.com/Farzansayeed/WinDock/actions/runs/40174183156) and [Preview #40174183214](https://github.com/Farzansayeed/WinDock/actions/runs/40174183214) SUCCESS, non-draft [v36](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.36-g40b8230) published.

**Code:** Add \`--backend-audit\` to already packaged portable read-only P2 diagnostic: reports OS/process architecture, presence of .NET 10 x64 shared runtime via read-only HKLM Registry64, and three boolean \`CN=HIDMaestroTestCert\` machine certificate-store matches (no certificate fingerprint/private key or identifiers). Does not install/load a driver, change trust/registry, escalate, query licence, create device or send network traffic. Existing no-args and \`--baseline\` remain untouched, so owner x64 XInput scan does not need repeat. \`--help\`, standalone README and safety oracle updated. Windows .NET probe CI and self-contained x64 artifact Preview smoke now exercise audit contract.

**P2 vendor evidence:** Verified current HIDMaestro 2.x signing/admin/.NET 10 and certificate Root/TrustedPublisher/My requirements and vendor uninstaller impact; only a conditional standalone/rollback lab candidate, NOT approved. libvirtualhid production-signed XUSB needs paid licence and periodic online validation, so blocked for fully offline/no-purchase deployment. Archived ViGEmBus not selected. Documented official sources, constraints, next owner-evidence gate in P2-DRIVER-FEASIBILITY.md.

**Tests:** New commit Actions CI/Preview PENDING at commit time. Baseline workflows above PASSED. No local .NET SDK/physical Windows hardware, no fresh Android or real Xbox/game test; only CI Windows runners can validate source and probe execution. A **new read-only audit** on owner's x64 PC is testable using a matching portable release EXE, not an installation; do not request XInput rerun. No driver/admin/cert/purchase approval requested or implied.

**Next:** Verify exact new GitHub CI/release and report new portable audit command/hash. Review audit results before preparing explicit, separately approved signed/reversible standalone driver trial. Keep production route disabled and existing WinDock features intact.

---

## 2026-10-25 — Supervise fake native stdout lifecycle and readiness ownership

**Branch / commit:** `feature/universal-gamepad`; this code + both tracker commit after `cdea63c7`, [CI #40172171992](https://github.com/Farzansayeed/WinDock/actions/runs/40172171992) and [Preview pipeline #40172172000](https://github.com/Farzansayeed/WinDock/actions/runs/40172172000) verified SUCCESS; [Preview v35](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.35-gcdea63c) published.

**Implementation:** Test-only Node→.NET bridge now requires an explicit initial native neutral fake report before v1 ready ACK; rejects premature/duplicate ready, non-neutral startup and malformed/unknown events; immediately reports native sink disposal/stop as fatal to the authenticated owner even if process has not yet exited; suppresses repeat faults; schedules 750ms forced reap after pipe shutdown, including broken stdin. Fixed child command / no shell remain defaults; child launcher dependency injection is confined to the lab oracle. Production server still has no gamepad sink.

**Tests:** Added `scripts/verify-gamepad-native-ipc.mjs` with synthetic local child streams (32 assertions on local stand-in protocol) covering success, premature ready, startup non-neutral, duplicate initial neutral/ready, bad events/JSON, child startup error, native sink loss before exit and unresponsive child force-reap. Registered with `test/run.mjs`; full GitHub CI and Windows .NET sidecar integration PENDING for this commit. No physical device proof, no real driver; previously accepted owner baseline remains accepted without retesting.

**Next:** Verify GitHub CI/Preview on exact commit; continue safe native ownership and failure-path work, with any real XInput driver install/rollback separately approval-gated.

---

## 2026-10-25 — Native clock-provider exceptions fail neutral (fake sink only)

**Branch / commit:** `feature/universal-gamepad` / this code+two-tracker commit after `aa53c71`. Baseline CI [#40170729166](https://github.com/Farzansayeed/WinDock/actions/runs/40170729166) and Preview [#40170729175](https://github.com/Farzansayeed/WinDock/actions/runs/40170729175) passed; non-draft Preview v34 published.

**Code:** Guard native receiver state acceptance and watchdog clock reads against unexpected time-provider exceptions. Both paths stop, submit neutral, dispose future controller sink and prevent native timer callback exceptions from escaping. Existing protocol, Android UI, original WinDock behavior and production disabled /gamepad remain unchanged.

**Automated tests:** Added deterministic C# fake-sink receive/watchdog injected-clock-fault assertions, verifying neutral + exactly-once disposal. New commit GitHub CI/Preview PENDING and no local .NET SDK available. Previously accepted Windows Preview and x64 read-only XInput 0/4 baseline plus Android v25 touch/regression tests are not repeated. Real virtual Xbox backend/PC gameplay remains unverified and unapproved.

**Next:** Check new CI and release, continue safe IPC process lifecycle. Real driver evaluation requires separately informed explicit approval.

---

## 2026-10-25 — Observe readiness before first native write; deny early/late input (fake sink only)

**Branch:** `feature/universal-gamepad`; second atomic source+both-tracker commit building on [`dbd0030`](https://github.com/Farzansayeed/WinDock/commit/dbd0030528a0032edfbcbfd028551c23d6ff644e). Its [CI #40170547492](https://github.com/Farzansayeed/WinDock/actions/runs/40170547492) PASSED Linux/macOS/Windows. New commit Actions and Preview not yet verified at commit. The previous Preview packaging workflow was still in progress when this commit was prepared.

**Code:** `src/gamepad/hub.js` now attaches an immediate rejection observer to an optional native readiness promise before writing the initial neutral state or invoking the liveness hook. An early initial-write exception can no longer strand an unhandled rejected startup promise in Node. Deferred readiness still gates WebSocket ACK and frame forwarding. No driver/API activation or ordinary WinDock behavior changes.

**Tests:** `scripts/verify-gamepad-readiness.mjs` adds premature client input rejection (no pressed controls passed to native), late native ACK after session closure, and simultaneous startup rejection + initial neutral write error without unhandled rejection; keeps existing healthy delayed ready/reconnect, rejected child, synchronous fault and exactly-once neutral close tests. Registered in Node suite from previous commit. New source CI/Preview still pending. No physical Windows/Android or game compatibility evidence, and no local dotnet SDK in agent runtime. Previously accepted Windows Preview, owner XInput 0/4 baseline and Android Preview local controls remain PASS without repeat.

**Next:** Verify GitHub multi-OS CI and preview workflow on this source; continue nonprivileged driver-neutral lifecycle work. Any real virtual Xbox driver/install/rollback requires separately explained explicit user approval. Spotify/indicators/DDC/Edge deferred.

---

## 2026-10-25 — P2/VS1 native process readiness and ownership safety (fake sink only)

**Branch / code commit:** `feature/universal-gamepad`, this atomic code+tracker commit following docs-only `d859b12`. Confirmed starting HEAD `d859b124bceea9e87b6e62b540f8e3865b8e4a16`; [handoff CI #40132376572](https://github.com/Farzansayeed/WinDock/actions/runs/40132376572) PASSED and highest non-draft [Preview v32](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.32-g3d5bf3b) published. New commit's CI and any Preview release **NOT YET RUN/VERIFIED at commit time**.

**Implementation:** Existing authenticated /gamepad channel with injected lab sink now requires an optional native receiver readiness promise before sending WS `ready` or accepting gamepad states; this preserves the behavior of synchronous in-memory sinks. A pending child cannot silently be treated as available; startup rejection, early frame, native fault (including synchronous onFault), late ACK, and stale owner go through neutral, sink disposal and owner release. The lab Node child bridge settles its readiness only after the .NET fake-sink v1 ready JSON event (not merely `spawn`), and rejects on failed child startup. Existing native 180ms watchdog and first-frame 1s grace are retained.

**Verification:** Added `scripts/verify-gamepad-readiness.mjs` as a cross-OS Node suite oracle for delayed ACK, forwarding only after ACK, startup rejection, synchronous fault, neutral cleanup, exactly-once disposal. Expanded Windows `scripts/test-gamepad-bridge.mjs` to require actual native ready event before frame injection and on each owner reconnect. Automated tests are **queued in GitHub Actions on push**; this execution environment has no .NET SDK or GitHub network access for local compilation. Do not mark CI success until actions finish. No newly performed Windows/Android hardware testing; owner-accepted prior physical Preview, read-only 0/4 XInput baseline and Android v25 regression checks stand without repeat.

**Safety:** This remains TEST-ONLY: ordinary WinDock `/gamepad` is 503; no virtual Xbox device, Windows driver, elevation, certificate trust change, licence, gameplay, cloud traffic or signing-secret access. Next: verify multi-OS CI and Preview publication; then continue driver-neutral lifecycle/security improvements or seek separately informed driver approval when ready. Spotify/indicators/brightness/Edge deferred.

---

## 2026-10-25 — Clean session close, durable October 26 handoff (docs only)

**User instruction:** Close work for today and continue tomorrow using repository docs; provide owner one copy-and-paste prompt and only truly unavoidable owner tasks. No unattended/background work is running.

**Verified at handoff:** Branch `feature/universal-gamepad` last CODE SHA `3d5bf3b90bf7579a809082b46f5021a5c5d05028` (native fake-sink initial-neutral write failure cleanup and exactly-once sink disposal regression); [CI #40131398154](https://github.com/Farzansayeed/WinDock/actions/runs/40131398154) PASSED Windows/Linux/macOS, [Preview workflow #40131398148](https://github.com/Farzansayeed/WinDock/actions/runs/40131398148) PASSED Windows installer smoke + native fake sink + Android build/tests/lint/permanent signer and published [Preview v32](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.32-g3d5bf3b). No signed Xbox virtual driver / live Android-to-PC gameplay.

**Previously accepted owner physical evidence, no retests:** Android v25 preview signed in-place update and local stick+A, neutral, original WinDock regressions PASS; Windows Preview correct Setup and launch PASS; read-only Windows x64 XInput slots 0–3 disconnected, `connected_slots=0` scan on `10.0.26300.0` PASS (valid pre-driver baseline), notes none. Never portray v32 as newly hardware tested.

**Docs changed together:** New `HANDOFF-2026-10-26.md`; AGENTS, NEXT-SESSION, PROGRESS, WORKLOG, P2-DRIVER-FEASIBILITY, SESSION-HANDOFF and 00-START-HERE front-page authority markers updated to correct obsolete v20 notes. Documentation only: no executable code, no installation or hardware tests and no need to publish new Preview. Check the new docs-commit CI separately.

**Next action:** New session rechecks HEAD, CI and latest numbered non-draft release; implements next small real driver-neutral P2/VS1 sidecar/IPC/fail-neutral safety gap, with automated tests and PROGRESS+WORKLOG together in every meaningful code commit. Preserve local-only gameplay, existing features and production /gamepad disabled until separate signed/licensed/offline/reversible physical backend approval. No privileged driver/trust/SDK/certificate/licence requests. Spotify/indicators/brightness/Edge deferred.

**Owner action before tomorrow:** NONE; copy the prompt.

---

## 2026-10-25 — Prevent half-constructed native controller sink leaks (fake sink only)

**Existing baseline:** Branch `feature/universal-gamepad` HEAD `531ba77` [CI #40130940148](https://github.com/Farzansayeed/WinDock/actions/runs/40130940148) passed; [non-draft Preview v31](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.31-g559b10e) published. Owner explicitly accepted read-only XInput baseline `Windows 10.0.26300.0 X64`, four disconnected slots, `connected_slots=0`, findings none. Their Windows Preview installation/start and Android v25 update/local controls + WinDock original feature regressions remain accepted, no repeat.

**Implementation:** In `native/gamepad-tests/GamepadReceiver.cs`, if the initial mandatory neutral `sink.Write` throws in the constructor, dispose the sink in a guarded catch and propagate the original error rather than leaking a partially initialized future controller. Timer still starts only after first successful neutral report. `native/gamepad-tests/Program.cs` now tests a fake sink that throws on initial neutral, asserting error propagation and exactly-once disposal. No real virtual controller backend is linked; production /gamepad remains disabled.

**Evidence / limits:** Source consistency checked before commit; NEW Windows .NET assertions and multi-platform CI / Preview pipeline **PENDING at commit**. Real Windows driver, signed/legal/offline redistributability, physical Xbox recognition, crash-to-neutral and Android-to-PC gameplay are **NOT VERIFIED**. No driver installation, administrator elevation, certificate trust modifications, licensing purchases or new network/cloud data. Spotify/indicators/brightness deferred.

**Next:** verify latest CI / preview on this source. Advance driver-neutral safety only; real P2 driver trials require separate informed explicit owner approval.

---

## 2026-10-25 — Verified v31 Node gamepad clock-safety tests and Preview release (docs follow-up)

**Code commit:** [559b10e](https://github.com/Farzansayeed/WinDock/commit/559b10ef931146836dc3344597e0c272b4db0453), `feature/universal-gamepad`. [CI #40130490213](https://github.com/Farzansayeed/WinDock/actions/runs/40130490213) **SUCCESS** (Windows/Linux/macOS/aggregate). [Preview release job #40130490212](https://github.com/Farzansayeed/WinDock/actions/runs/40130490212) **SUCCESS**, including Windows isolated Preview installer smoke and native fake-sink verification, Android unit/lint/stable preview signer and publish. Published [NON-DRAFT Preview v31](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.31-g559b10e) has WinDockGamepadPreviewSetup.exe, Android APK, standalone x64/ARM64 read-only XInput probes, hashes, build and public signer information.

**Validated code behavior (automated only):** Node controller state lease fails closed on monotonic time rollback during receipt or polling, neutralizes held control state; paired gamepad WebSocket denies invalid/rolled-back or >1000ms-late first frame at arrival even if watchdog callback is delayed. JS assertions ran on CI, and native fake-sink bridge coverage ran on Windows. These are not tests of a signed real virtual Xbox driver, physical gamepad input, USB tether, game control, crash-to-neutral or latency.

**Owner accepted:** P2 *read-only* Windows x64 XInput scan PASS, Windows 10.0.26300.0 slots 0–3 all disconnected / connected_slots=0; observations `none`. Previous Windows Preview install/start and Android v25 installation/multitouch/existing WinDock regression PASS. Do not request any retest for those. New changes are not accessible as user-visible controls because production /gamepad still responds 503 without an approved physical backend. **No new owner physical testing is required for this increment.**

**Next work:** Continue safe nonprivileged P2/VS1 driver-neutral code and fail-neutral tests; P2 signed/legal/distributable/offline virtual Xbox hardware requires a separate explicit approval before any driver installation, certificate trust, elevation or licensing. Spotify, running indicators, brightness deferred.

---

## 2026-10-25 — Owner baseline accepted; driver-neutral Node WS timing safeguards

**Owner physical evidence accepted:** Windows read-only XInput baseline **PASS**, `windows_version=10.0.26300.0`, x64, XInput slots 0–3 disconnected, `connected_slots=0`, other findings verbatim: `none`. Zero controllers visible is an expected pre-driver result, not evidence of a working virtual Xbox controller. Windows Gamepad Preview setup/start and Android v25 in-place upgrade, stick+A and original WinDock regression checks also previously PASS; do not rerun.

**Prior evidence:** `feature/universal-gamepad` HEAD [dec43d8](https://github.com/Farzansayeed/WinDock/commit/dec43d8e7cb9c8378d9687c9159a005744e878ab), [multi-platform CI #40129631518](https://github.com/Farzansayeed/WinDock/actions/runs/40129631518) passed. [Preview v30](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.30-gfd82cfd) is the latest non-draft at the beginning of this increment.

**Implementation:** `src/gamepad/protocol.js` now expires and neutralizes held inputs on monotonic-clock rollback at frame receive or independent poll, matching native .NET `StateLease`. `src/gamepad/hub.js` now refuses first WebSocket input after >1000ms startup grace, clock rollback or non-finite time *on frame arrival*, not solely a delayed timer callback. `scripts/verify-gamepad-protocol.mjs` and `scripts/verify-gamepad-hub.mjs` add deterministic regression/boundary assertions. Production /gamepad remains 503 without an approved native real device backend. Nothing installs drivers or changes Windows trust, privileges, app launch, original Touchpad or Android gameplay routes.

**Testing:** Source patch preflight reviewed; new Linux/macOS/Windows CI and Preview build triggered on push. At commit time both new workflows, local hardware output and any new published artifact are **PENDING**; the agent has no access to the owner's hardware. Tests are simulated/in-memory or fake native sink, NOT a physically recognized XInput virtual device. No game or latency tests, driver rollout/rollback proof, signed/legal/offline backend validation or Android-to-PC VS1 verified.

**Next:** Verify actual CI and published release; only request physical acceptance for a feature truly changed in the app, not the user's already-passed baseline. Real virtual Xbox P2 driver needs separately explained risks and explicit authorization. Spotify, running indicators and brightness deferred.

---

## 2026-10-25 — Successful owner hardware XInput scan (zero slots), acceptance still unchecked

**Owner's report, verbatim:**
```text
WinDock P2 BASELINE: read-only, no admin and no driver changes.
windows_version=10.0.26300.0
os_architecture=X64
process_architecture=X64
Physical and virtual XInput controllers cannot be distinguished here.
XInput slot scan (read only).
slot=0 disconnected
slot=1 disconnected
slot=2 disconnected
slot=3 disconnected
connected_slots=0

Press Enter to close this read-only report...
```

**Technical assessment:** On the owner's actual x64 Windows machine, the portable Preview v30 read-only XInput probe read **all four** XInput slots and displayed the expected interactive completion prompt. `connected_slots=0` is an expected, valid pre-driver **success**: it means no active XInput controller was visible at that instant, not a faulty probe. It does NOT demonstrate any virtual Xbox controller, driver installation, or game compatibility. The submitted checkbox said **NOT WORKING / NOT CHECKED**; per AGENTS.md, keep owner acceptance **unchecked** pending acknowledgement of the correct criterion, without asking the owner to rerun the probe. No owner-provided SHA256 or exit code.

**Carry-forward:** Previously accepted Windows Preview installer and launch PASS, Android v25 signed Preview upgrade, local two-finger stick+A and Touchpad/Signature/keyboard/dock regressions PASS. Do not reinstall or repeat tests. Prior baseline source [c4ca40f](https://github.com/Farzansayeed/WinDock/commit/c4ca40fee8d15b5e160d4a87f617e35d0806d1e6) [CI #40123958744](https://github.com/Farzansayeed/WinDock/actions/runs/40123958744) PASSED and [Preview v30](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.30-gfd82cfd) published.

**Change/test:** This commit changes only PROGRESS, WORKLOG, NEXT-SESSION and P2 feasibility documentation; no executable changes, and no additional physical test conducted by agent. Post-commit CI pending. No Windows security changes or driver/admin/certificate/license actions allowed. Next: user confirms the already-observed read-only four-slot zero-connected output is acceptable; separate future P2 driver proof still gated behind explicit permission. Spotify/indicators/brightness/Edge icon deferred.

---

## 2026-10-25 — Owner confirms Windows Preview restored; only P2 read-only baseline remains (documentation checkpoint)

**Branch:** `feature/universal-gamepad`; this commit updates both PROGRESS.md and WORKLOG.md. Previous `fd82cfd` [multi-OS CI #40122957362](https://github.com/Farzansayeed/WinDock/actions/runs/40122957362) **PASSED** and [release workflow #40122957459](https://github.com/Farzansayeed/WinDock/actions/runs/40122957459) **PASSED**. Latest highest numbered non-draft [Preview v30](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.30-gfd82cfd) contains Windows setup, Android Preview, x64 and ARM64 read-only portable XInput probe EXEs, SHA256SUMS, SIGNING-INFO and BUILD-INFO.

**Owner physical evidence (explicitly user-reported):** "PASS: Correct Windows installer completes"; "PASS: WinDock Gamepad Preview starts"; "Other findings / observations (verbatim): none". Accept both physical Windows **Preview restoration** checks; do not repeat them. Previously accepted v25 Android signed Preview upgrade + native two-pointer stick+A and original WinDock feature regressions remain PASS. This does NOT prove regular WinDock reinstallation, data backup restoration, real Xbox/XInput virtual output or gamepad-in-game controls.

**P2 status:** Read-only owner Windows 10/11 XInput baseline is the **sole outstanding physical check**. Earlier failed `dotnet run` lacked SDK, downloaded unsigned .ps1 was blocked by PowerShell policy, old portable v28 double-click closed before the output could be read, and user mistakenly uninstalled WinDock to use a diagnostic. All are distinct from actual XInput device failures. The standalone v30 probe EXE is NOT an installer: verify its SHA256, run `--baseline` from a pre-opened non-admin terminal, observe Windows version/arch, four slot lines and connected_slots plus exit code; zero connected is a valid baseline. v30 x64 published sha256 `2bbf2b00a443d81d41d3573c7fff76f3c0ec308eeacc04d8cec059472f32bd6c`. Report if unsigned EXE blocked; never bypass Defender/SmartScreen/WDAC/AppLocker/ExecutionPolicy. No driver, administrator rights, certificate trust or licence changes.

**Scope/tests:** Documentation-only update; no executable application changed. Existing source CI/Preview release verified, new documentation CI pending. No test on owner's actual Windows XInput slots; no virtual Xbox driver/rollback or gameplay proof. Do not advance to privileged P2 driver integration. Spotify/dots/DDC, Edge icon and P8 deferred.

**Next:** Receive owner's single remaining physical `--baseline` output (or exact block) before proceeding; record the result objectively.

---

## 2026-10-24 — Owner uninstalled WinDock after confusing Xbox probe with installer (docs only)

**Owner evidence:** They deleted 'the windock app' to install it through an EXE; after clicking Run the console appeared for a fraction of a second and vanished, and nothing installed. The file was the XInput portable diagnostic, not Setup. No evidence whether original Windows WinDock or Windows Gamepad Preview was removed, whether saved settings remain, or whether Windows baseline was captured. Physical Android Preview v25 install and Gamepad/Touchpad regressions remain accepted PASS. **Do not claim software restored.**

**Verification:** Latest non-draft [Preview v29](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.29-gbf54e9b) contains both `WinDockGamepadPreviewSetup.exe` and `WinDockGamepadProbe-win-x64.exe`; [release #40120421204](https://github.com/Farzansayeed/WinDock/actions/runs/40120421204) passed Windows setup smoke, Android and portable probe. Prior [CI #40120809334](https://github.com/Farzansayeed/WinDock/actions/runs/40120809334) passed. Updated INSTALL-PREVIEW and gamepad-probe README to distinguish installer vs diagnostic and avoid unnecessary uninstall; refreshed PROGRESS and NEXT-SESSION. Documentation-only change: no runtime/hardware tests, privileged setup, driver or certificate changes.

**Next:** Owner reinstalls the appropriate Windows edition using its true verified installer, if Windows allows normal safe setup, and confirms the WinDock host launches. Windows owner XInput slots remain UNVERIFIED; gather separate safe read-only terminal report later if needed. Do not repeat already passed Android checks, or work on deferred Spotify/DDC/running dots.

---


## 2026-10-24 — Verified Preview v29 double-click baseline and automated checks

**Feature implementation:** [bf54e9b](https://github.com/Farzansayeed/WinDock/commit/bf54e9b0651a3ddab39433c8214f6070889f9a1f) on `feature/universal-gamepad`. [Multi-platform CI #40120421196](https://github.com/Farzansayeed/WinDock/actions/runs/40120421196) **PASSED on retry (attempt 2)**; on attempt 1 Windows npm test failed *only* unrelated `verify-linux.mjs` recorder errors (other test oracles including Gamepad Probe PASS), no gamepad code involved in that failure. Failed jobs re-run via GitHub; Windows, Linux, macOS, aggregate all succeeded. [Preview build/publish #40120421204](https://github.com/Farzansayeed/WinDock/actions/runs/40120421204) **PASSED** Android tests/lint/permanent signing, Windows installer smoke, portable XInput executable x64 `--help`, no-arguments and `--baseline` from System32, and release publishing. [Non-draft Preview v29](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.29-gbf54e9b) ships portable win-x64 and win-arm64 read-only unsigned probes with SHA256SUMS.txt, BUILD-INFO, Windows installer and Android APK. x64 public asset SHA256: `0dd57d8d1f859910b63d1bdc805beacf556b8284a78f689692ef25fd7a28c0d3`.

**Actual owner status:** Android v25 upgrade PASS; gamepad local stick+A and existing features PASS; do not repeat. Windows physical XInput baseline **NOT WORKING/UNCHECKED** because earlier no .NET SDK, unsigned PowerShell blocked, then v28 console double-click flashed away without captured text. The source now displays a baseline with no args and waits for Enter when connected to an interactive console. CI checks no-args output and exit under redirected runner; does NOT test a real Explorer console pause or owner XInput slot counts. User has not yet tried v29. A flash in v28 is not proof of no XInput device. ARM64 binary cross-published but not physically executed.

**Safety:** Do not request Windows admin, security bypass, cert changes, private keys, licences or driver install. EXE remains unsigned; if Windows blocks execution under Defender/SmartScreen/WDAC/AppLocker, report exact message rather than bypass. No signed virtual Xbox driver or PC gamepad test exists.

**Only next owner check:** Download v29 WinDockGamepadProbe-win-x64.exe (or ARM64 by OS architecture), verify SHA256 against release, double-click if allowed by Windows policy and confirm Windows version, 4 slots, connected_slots, press Enter only after reading. Provide output/error via optional findings textbox. Spotify, app running indicators, brightness, Edge icon and P8 deferred.

---

## 2026-10-24 — Owner v28 EXE disappears after double-click; keep baseline visible

**Branch/commit:** `feature/universal-gamepad`, this code commit updates BOTH PROGRESS.md and WORKLOG.md. Prior HEAD [49cc17b](https://github.com/Farzansayeed/WinDock/commit/49cc17bfbb82393dfdc8982f348a7f0f3f3bbee6) [CI #40119538409](https://github.com/Farzansayeed/WinDock/actions/runs/40119538409) PASSED; latest non-draft [v28](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.28-g0ad2b5f) released with unsigned x64/ARM64 read-only executables.

**Owner report (verbatim gist, not a successful XInput test):** Owner clicked Run when the Windows dialog appeared; a command shell opened for a fraction of a second and closed with no captured output. The EXE is a console application that previously performed a quick --scan when run with no arguments. This experience is expected for a double-clicked console executable; no controller detection or security acceptance inferred. Previous unsigned .ps1 and no-SDK paths also failed. Owner Android v25 update and all four UI/feature regressions stay PASSED, no repetition.

**Changes:** Read-only probe's no-argument path now prints full OS/version/architecture/XInput slot baseline and keeps its directly launched interactive console visible until user presses Enter. Explicit --baseline, --scan and CI/redirected process remain noninteractive. Added source static assertions, Windows release-workflow no-args smoke alongside --baseline, user-facing README / release notes. All normal WinDock host/Android/Touchpad behavior unchanged. No driver, .NET installation on user PC, certificates, UAC/elevation, security policy bypass or paid licence involved.

**Tests:** Reviewed source and amended CI tests before committing; new GitHub CI, installer/release and owner physical test pending. Later release CI must prove no-argument output and clean exit; a redirected CI process cannot fully prove Explorer-created console pause (requires owner physical check). No P2 signed device or VS1 real PC gameplay tested.

**Next:** Review GitHub multi-OS CI and newly numbered published Preview. Owner tries new checksum-verified read-only EXE with double-click, observes report and Enter pause, or submits exact security block. P2 virtual-controller backend remains behind informed consent and reversibility. Other WinDock issues deferred.

---

## 2026-10-24 — Verified unsigned portable XInput baseline Preview v28 / owner check pending (documentation only)

**Implementation source:** [0ad2b5f](https://github.com/Farzansayeed/WinDock/commit/0ad2b5f342355622b2d525ab9ec83b413ba5fc3e) on feature/universal-gamepad. [CI #40119186037](https://github.com/Farzansayeed/WinDock/actions/runs/40119186037) **PASSED** Linux, Windows, macOS and aggregate. [Preview workflow #40119186029](https://github.com/Farzansayeed/WinDock/actions/runs/40119186029) **PASSED** Windows installer smoke, .NET native checks, self-contained portable XInput x64 --help/--baseline test from System32 with all four XInput slots, Android unit/lint/stable-signer and GitHub publication. Published [Preview v28](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.28-g0ad2b5f) is non-draft and includes x64 and ARM64 portable read-only EXEs (with release SHA256SUMS.txt and BUILD-INFO.txt). ARM64 was cross-compiled only, not executed on ARM64 hardware.

**Owner acceptance:** Android v25 in-place update PASS; native local stick + A and original Touchpad/Signature/keyboard/dock regression PASS, retained without repetition. Windows owner SDK approach FAILED (SDK absent) and downloaded unsigned PowerShell script FAILED (security policy refuses unsigned scripts); both failed before invoking XInput. **Owner's Windows physical XInput baseline remains NOT WORKING/UNCHECKED pending portable EXE test.** Zero slots reported by owner's PC, if so, will count as valid baseline; there is no real Windows virtual controller installed or approved.

**Safety:** Windows portable EXEs are unsigned, not virtual drivers, do not install or modify Windows trust. If antivirus, SmartScreen, AppLocker or WDAC blocks the EXE, stop and report; never bypass security policy. No driver installation, privileges, passwords, signing keys, licences or cloud gameplay. No real Android-to-PC game controls tested.

**Next:** Only owner runs the appropriate checksum-confirmed Preview v28 standalone read-only EXE with --baseline without administrator privileges and reports the output or exact block. Then evaluate P2 signed, legally distributable offline XInput device on separately approved disposable PC. This documentation follow-up should not publish a new runtime build. Spotify/indicators/DDC deferred.

---

## 2026-10-24 — Owner signed-script policy blocks XInput baseline: ship portable executable

**Branch / commit:** feature/universal-gamepad; this code commit includes both PROGRESS.md and WORKLOG.md. Prior [d58c31f](https://github.com/Farzansayeed/WinDock/commit/d58c31f0f2096341cd4882383f63cd44ededf1e4), [CI #40117938713](https://github.com/Farzansayeed/WinDock/actions/runs/40117938713) and Preview v27 verified.

**Owner evidence:** Android Preview v25 update PASS, native stick+A and Touchpad/Signature/keyboard/dock regressions PASS (carry forward). Windows XInput baseline NOT WORKING: owner first had no dotnet SDK, then downloaded script WinDock-XInputBaseline.ps1 which Windows refused due unsigned script (PSSecurityException, UnauthorizedAccess). No actual XInput slot scan executed. Respect execution-policy restrictions.

**Implementation:** Publish read-only, self-contained portable Windows XInput executable for x64 and ARM64 from existing C# probe on Windows CI; execute x64 --help and --baseline from System32 with output checks; add both binaries to GitHub release and SHA256SUMS. ARM64 cross-built, not physically tested. README and static verification now offer this path without requiring .ps1 or SDK. Binaries are UNSIGNED; users must not bypass SmartScreen, AppLocker, WDAC, antivirus or company policy. No driver, elevation, certificate changes, WinDock runtime modification or cloud dependency.

**Tests at commit:** Workflow/source static assertions inspected; new CI/release not yet run. Owner PC baseline/physical XInput device and Android-to-PC game output NOT VERIFIED.

**Next:** Verify all GitHub Actions and published preview with portable assets. Request only owner Windows baseline using security-policy-permitted checksum-confirmed executable; no new Android testing needed. P2 backend proof still blocked pending separate explicit approval. Spotify, indicators and brightness deferred.

---

## 2026-10-24 — Verified SDK-free Windows baseline CI + Preview v26 publication (documentation follow-up)

**Source:** [5a21ea5](https://github.com/Farzansayeed/WinDock/commit/5a21ea59d2755745b98e4c260086d07ef8ee5e21) on `feature/universal-gamepad`. [CI #40117635358](https://github.com/Farzansayeed/WinDock/actions/runs/40117635358) **SUCCESS** Linux/macOS/Windows and aggregate. The Windows job executed new SDK-free PowerShell diagnostic from System32 and checked OS/version, all four XInput slot lines and connected count, in addition to existing .NET/Node test suites. [Gamepad Preview build #40117635340](https://github.com/Farzansayeed/WinDock/actions/runs/40117635340) **SUCCESS** Windows installer, Android JVM/lint/signature and GitHub publish. [Preview v26](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.26-g5a21ea5) **PUBLISHED/NON-DRAFT** with Windows Preview installer, signed Android Preview APK, BUILD-INFO, SHA256SUMS and public SIGNING-INFO.

**Documentation correction:** Fixed unnecessary double backslashes in copyable Windows PowerShell paths in `native/gamepad-probe/README.md` (a docs-only change, no behavior changed).

**Owner acceptance carried forward:** v25 Preview Android upgrade PASS, native Gamepad controls/original features PASS. No need to retest those. Owner PC P2 baseline remains NOT WORKING/UNVERIFIED until the replacement read-only script is executed there; previous SDK command never reached XInput. No real XInput device installed or detected on owner's computer, no gamepad-in-game proof; CI virtual runner cannot replace physical evidence.

**Next owner step:** Download/open reviewed `WinDock-XInputBaseline.ps1` from GitHub and run by its full file path using normal non-admin Windows PowerShell 5.1. Return non-secret version and slot output, or exact error. No .NET SDK, admin, driver, certificate, licence or Android retest requested.

---

## 2026-10-24 — Recover owner failed Windows baseline without installing an SDK

**Branch/commit:** `feature/universal-gamepad`; code and BOTH PROGRESS.md/WORKLOG.md in this commit. Previous [2c05bbd](https://github.com/Farzansayeed/WinDock/commit/2c05bbdda5da4a7eb856cce975bfb363a2db6513) [CI #40115473486](https://github.com/Farzansayeed/WinDock/actions/runs/40115473486) and [preview packaging #40115473511](https://github.com/Farzansayeed/WinDock/actions/runs/40115473511) passed; [v25](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.25-g2c05bbd) published.

**Owner physical report:** Android Preview v25 upgrade **PASS** and native touch Gamepad / existing WinDock regression **PASS**. Preserve acceptance; do NOT ask owner to redo. Windows XInput baseline **NOT WORKING/UNVERIFIED**: from `PS C:\\WINDOWS\\system32>` the owner ran repo-relative `dotnet run --project native/gamepad-probe/WinDock.GamepadProbe.csproj -c Release -- --baseline`; terminal returned `No .NET SDKs were found` and `The application 'run' does not exist`. No Xbox/XInput hardware detection was tested.

**Fix:** Added `native/gamepad-probe/WinDock-XInputBaseline.ps1`, a standalone SDK-free Windows PowerShell 5.1 four-slot baseline using built-in `Add-Type` and `xinput1_4.dll!XInputGetState`; works by absolute path from any CWD, no credentials or machine identifiers. Expanded `scripts/verify-gamepad-probe.mjs` static no-writes contract, documented no-SDK recommended command/zero slots in README, added Windows Actions execution from System32. No driver, device creation, admin, trust-store or normal app changes.

**Verification:** Prior commit CI passed, source checks prepared; NEW Windows CI and owner Windows physical baseline **not yet run at commit time**. No real signed/offline Xbox backend selected, installed or confirmed in a game.

**Next:** Confirm new Actions before presenting only SDK-free baseline owner test; keep driver approval gate and VS1 physics pending. Spotify/dots/DDC/Edge logo deferred.

---

## 2026-10-24 — Native clock-rollback and startup-deadline fail-neutral tests (fake sink only)

**Branch:** `feature/universal-gamepad`; this code commit includes BOTH PROGRESS and WORKLOG. **Verified prior HEAD:** [a2603b9](https://github.com/Farzansayeed/WinDock/commit/a2603b93ebe77a978b8a304ed522cf8850a8c1c2) [CI #40114291891](https://github.com/Farzansayeed/WinDock/actions/runs/40114291891) passed. Latest published non-draft Preview is [v24](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.24-ga98eef2).

**Changed:** `native/gamepad-tests/GamepadState.cs` expires and neutralizes an active lease if its injected monotonic clock decreases on Receive or Poll. `GamepadReceiver.cs` also refuses a delayed first state after its 1,000-ms first-frame deadline (without relying on next timer tick), and closes/neutralizes on pre-first-frame clock rollback. `native/gamepad-tests/Program.cs` adds deterministic rollback, timer poll, late-first-frame and fake-sink disposal regression assertions. No device driver, network adapter or privileged behavior added.

**Tests/evidence:** Reviewed and statically checked all targeted source replacements before commit. Actual `dotnet` test execution unavailable in this execution environment; new Windows GitHub CI pending and must be checked after push. No physical Windows Xbox slot, user Windows baseline, signed/reversible driver, Android-to-PC gamepad, game compatibility, crash-to-neutral or latency was physically verified. Passing fake-sink assertions never establishes real driver behavior.

**Next:** Check new Windows/multi-OS CI and Preview applicability. Gather owner non-admin v24 / XInput baseline acceptance; advance P2 on approved disposable Windows with signed/offline/legal/rollback evidence before connecting production VS1. Spotify/dots/DDC and Edge logo remain deferred.

---

## 2026-10-24 — P2 baseline / Kotlin handshake v24 released and CI passed (documentation update)

**Branch:** `feature/universal-gamepad`; source [`a98eef2`](https://github.com/Farzansayeed/WinDock/commit/a98eef26a74ddba11e97397aae3930ccd29b4997). [CI #40113968394](https://github.com/Farzansayeed/WinDock/actions/runs/40113968394) **PASSED** Linux/macOS/Windows and aggregate, including Windows read-only XInput baseline command and Node static checks. [Release workflow #40113968453](https://github.com/Farzansayeed/WinDock/actions/runs/40113968453) **PASSED** Android Preview JVM tests/lint/signing, Windows installer smoke and publishing. [Published Preview v24](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.24-ga98eef2) verified non-draft with Windows installer, signed Android Preview APK, SHA256SUMS.txt, BUILD-INFO.txt, public SIGNING-INFO.txt.

**Acceptance reality:** Owner confirmed v23 install/update, local Gamepad navigation, native multitouch/neutral and existing features passed; v24 has **NOT** been physically upgraded/inspected on owner's hardware yet. Windows read-only P2 `--baseline` command **NOT** run on owner's PC yet (CI ran on Windows runner only). Kotlin owner/WS ACK tests use FAKE SOCKETS and do not prove actual Android-to-PC controls or Xbox XInput. New findings: Microsoft Edge tile shows M rather than its logo — deferred, not investigated.

**Next:** Provide user acceptance checklist for v24 signed in-place Android Preview update and optional nonadmin .NET 8 read-only XInput baseline. Capture any unexpected behavior in verbatim findings box. Do not attempt real signed driver installation, admin elevation or trust modifications without explicit approval. Production `/gamepad` remains disabled; Xbox game support UNVERIFIED.

---


## 2026-10-24 — Owner v23 acceptance + P2 read-only baseline and VS1 native handshake model

**Branch:** `feature/universal-gamepad`; this implementation commit. Baseline `ab23f133ceb98c7c54c6a2e089005dc7bcc3a87f`, [CI #40111404640](https://github.com/Farzansayeed/WinDock/actions/runs/40111404640) passed. Latest published numbered [Preview v23](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.23-g325bcb6), release CI/build previously passed.

**OWNER'S PHYSICAL REPORT (NOT AGENT HARDWARE OBSERVATION):** All four Preview v23 checks PASSED: Android preview install/update, same-LAN paired Touch & sign ↔ Gamepad, multitouch native stick/A with neutral on exit, Touchpad/Signature/keyboard/dock regression. **Other finding (deferred):** Microsoft Edge's logo rendered as **M**. Record as pending icon fidelity issue, do not work on it while owner requests Gamepad priority. No proof of XInput/PC gameplay or Windows signed driver.

**Code:** New `GamepadSocketTarget.kt` ensures the only socket endpoint candidate is /gamepad on exact trusted local WinDock origin. `GamepadOwnerChannel.kt` is transport-injected: waits for strict v1 ready ACK, never sends pre-ready touch states, handles first neutral/whole-state heartbeat through prior `GamepadInputSession`, aborts and sends best-effort neutral on failures, and closes socket exactly once. No Android actual websocket, credential handling, or native virtual controller; normal Android UI remains local-only. Six JVM fake transport/policy tests cover handshake, forbidden ready, deadlines, clock rollback, reconnect, stick+A state, and wrong-origin URL. Separately `native/gamepad-probe --baseline` emits Windows version/architecture and read-only 0-3 slot state; no identifiers, elevation or installs. Updated probe Node static contract, README, and Windows CI baseline.

**Tests:** Prior HEAD CI success. This code added Android JVM tests and CI Windows --baseline; at commit time **new CI NOT YET CHECKED**. No local Android Gradle/.NET SDK or Windows physical machine used. Tests of fake sockets are not real Android network sessions. Owner does not need to install drivers or certificate roots for P2 baseline.

**Next:** Review CI, request owner read-only Windows baseline. Research legally redistributable signed offline-friendly device on disposable Windows host; any privileged installation requires explicit owner approval and rollback. Keep Spotify, running dots, DDC and Edge icon deferred.

---


## 2026-10-24 — Kotlin sender Preview v23 automated verification completed (documentation only)

**Branch:** `feature/universal-gamepad`; implementation source commit [`325bcb6`](https://github.com/Farzansayeed/WinDock/commit/325bcb6a9ed820bb7c4ec2fa95d0eb592b78afc7). [CI #40111015027](https://github.com/Farzansayeed/WinDock/actions/runs/40111015027) **PASSED** all three OS jobs plus aggregate. [Release workflow #40111014996](https://github.com/Farzansayeed/WinDock/actions/runs/40111014996) **PASSED** Android JVM tests, lint, Android signer check, Windows installer smoke and publication. [Published Gamepad Preview v23](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.23-g325bcb6) is non-draft and contains Android APK, Windows installer, SHA256SUMS.txt, BUILD-INFO.txt, and PUBLIC SIGNING-INFO.txt.

**Scope:** No new executable code in this docs follow-up. Confirms prior code tests completed successfully; it remains a LOCAL UI with unused Kotlin GamepadInputSession and fake/native test receiver. Never infer a working controller, native Android WebSocket, signed physical XInput driver, phone data-preserving upgrade or game compatibility from CI.

**Still NOT TESTED:** Owner Android UI navigation, preview in-place APK upgrade, full Touchpad/Signature regression, physical Windows virtual controller, native crash/driver rollback, actual gameplay. Require explicit informed approval for any privileged P2 backend investigation/install. Follow AGENTS.md end-session interactive owner checklist and optional findings box; unchecked items block next acceptance step.

**Next:** Owner tests Preview v23 safe phone/PC UI regressions; on pass continue P2 legally redistributable signed offline backend feasibility/Android session ownership transport, while no real Xbox device selected.

---


## 2026-10-24 — Transport-neutral Kotlin input session, staged VS1

**Branch:** `feature/universal-gamepad`; source commit is the commit containing this entry. Prior baseline `3ba40cab60637a2d412d5f71af43b25c8207c1d1`, [CI #40110375230](https://github.com/Farzansayeed/WinDock/actions/runs/40110375230) passed. Highest published non-draft Preview [v22](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.22-g69ba9d7). Owner explicitly reported previous AGENTS/PROGRESS/WORKLOG acceptance checks PASSED with no findings, authorizing progress to next implementation work.

**Code changes:** New Android Kotlin `GamepadInputSession.kt` with injected text-sink, no hardcoded socket, fresh sequence per authenticated-ready session, initial neutral, immediate A press/release edges, coalesced axis-only input, periodic 40-ms whole-state heartbeats (caller must schedule timer), fail-neutral close, terminal state on clock rollback or failed transport. New optional `GamepadTouchView.onStateChanged` observer exposes real native pointer model after moves/releases/cancel, but it is **NOT CONNECTED to any network/driver**. Existing Touchpad, Signature, keyboard/pairing and WinDock host unchanged. New `GamepadInputSessionTest.kt` Android JVM fake-sink tests.

**Tests:** Standalone `kotlinc` + `java -jar` smoke on a matching codec/touch model source shape PASSED (initial neutral, coalescing, immediate A edges, heartbeat, terminal neutral and failed sink); this is NOT a real Android Gradle test. Android Gradle `testDebugUnitTest`, lint, Windows/Linux/macOS CI and preview APK rebuild will be checked via GitHub Actions after push; **not run at commit time**. Real Android UI/device, pairing session socket, actual XInput slot/driver, game movement and hardware neutral watchdog **NOT TESTED**.

**Blocker/next:** Physical P2 signed legally redistributable offline-compatible Xbox device remains unselected; don't install/elevate/change root trust without approval. Next add lifecycle-bound authenticated Kotlin transport with a fake Windows sink and actual owner tests before attaching hardware. Spotify/dots/DDC and P8 deferred.

---


## 2026-10-24 — Additional findings text box for every owner acceptance checklist (docs only)

**Branch:** `feature/universal-gamepad`; new policy commit is the commit containing this entry. Baseline [`7439033`](https://github.com/Farzansayeed/WinDock/commit/7439033f68b7eb816a9b4b114cd46a8b87d4e8bf) passed [CI #40110167483](https://github.com/Farzansayeed/WinDock/actions/runs/40110167483). Latest published numbered [Preview v22](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.22-g69ba9d7) remains simulation-only.

**Changed:** Extended AGENTS.md end-of-session acceptance contract: every checklist must have a user-editable, optional multiline **Other findings / observations** box immediately under its checks. Store notes alongside checkbox state and include the exact entered text in both Proceed and Report issues user actions; leave blank notes optional. All unchecked items still count as NOT WORKING and block progression; any noted failure should keep its corresponding item unchecked. Do not invite passwords/PINs/private signing material. Added Markdown fallback requiring free-text findings alongside manual check replies.

**Verification:** GitHub file-policy readback only. No executable code, runtime test, Android/Windows hardware test, new gamepad/XInput driver, privileged changes, or actual gameplay. Previous baseline CI succeeded; new documentation commit CI not yet available at commit time.

**Next:** Request owner's checkbox verification of the new policy and optional notes field; then continue unfinished P2/VS1 implementation behind safety gate. Deferred WinDock issues remain untouched.

---


## 2026-10-24 — Required owner checklist with gated Proceed action (policy only)

**Branch:** `feature/universal-gamepad`; this policy commit is the one adding the mandatory AGENTS.md section. Baseline [`69ba9d7`](https://github.com/Farzansayeed/WinDock/commit/69ba9d71997a9ff3913235c72b5d4f22f4897347), [CI #40109440668](https://github.com/Farzansayeed/WinDock/actions/runs/40109440668) and [Preview workflow #40109440597](https://github.com/Farzansayeed/WinDock/actions/runs/40109440597) have passed.

**Changed:** AGENTS.md now explicitly requires each session to finish with realistic, initially unchecked user testing criteria, what to look for, and an interactive **Proceed** button enabled only after all required checks are confirmed by the owner. An unchecked/not-performed item counts as not working for user acceptance and blocks progression. Include a **Report issues** action to submit unchecked items for fixes. If controls unavailable, use Markdown checkbox fallback and explicit pass/fail replies. Do not claim real XInput from fake CI or require impossible hardware testing for a documentation-only change.

**Tests:** Documentation policy inspection/readback requested from owner via the checklist; no code modified, no local hardware or emulator tests, no driver/admin/certificate changes. Previous CI and preview succeeded; **this commit's CI not run at commit time**. The physical Xbox/XInput Windows device and Android-to-PC gameplay remain unverified.

**Next:** Owner review of new checklist instructions, then continue safe P2 signed/offline driver feasibility and VS1 engineering according to already agreed roadmap. Keep other WinDock issues deferred.

---


## 2026-10-24 — Paired WebSocket to isolated fake native receiver and child lifecycle

**Branch:** `feature/universal-gamepad`; commit is the implementation commit containing this entry. **Verified predecessor:** [`ef657a5`](https://github.com/Farzansayeed/WinDock/commit/ef657a5afa5265994fd3b2b832be6cacad5398ce), [multi-OS CI #40108234730](https://github.com/Farzansayeed/WinDock/actions/runs/40108234730) and [preview packaging #40108234505](https://github.com/Farzansayeed/WinDock/actions/runs/40108234505) succeeded; [non-draft Preview v21](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.21-gef657a5) has signed Android preview, Windows installer, hashes and public certificate info.

**Implementation:** Added lab-only native sink factory at `scripts/lib/native-gamepad-fake-bridge.mjs` with single child per authenticated owner, inherited private stdio, bounded report encoding, native-sequence remapping, fail-closed backpressure, process-error/exit monitor, and EOF/forced-kill cleanup. `src/gamepad/hub.js` accepts optional `onFault` so a dead native sink immediately ends the WebSocket owner (no effect on established in-memory sink contract). Added Windows-only `scripts/test-gamepad-bridge.mjs` with real local HTTP PIN auth and WebSocket; denied unauthorized/cross-origin/busy requests must not spawn a child; native independent 180-ms neutral expiry, socket-drop EOF cleanup and synthetic child termination must release owner. This lab bridge is NOT injected into production `server.js`.

**Tests recorded at commit:** Previously verified predecessor Windows/Linux/macOS CI passed. New command `node scripts/test-gamepad-bridge.mjs` added to Windows CI after .NET sidecar build. **New-commit CI PENDING** at commit, local .NET SDK unavailable. Physical XInput, Windows gamepad output, Android network input, native driver crash, installed hardware rollback, latency measurements **NOT TESTED**. A simulated killed fake-sink process cannot prove real device release; avoid calling gamepad functional.

**Next:** Review CI errors, keep virtual driver gate closed pending informed P2 approval/test on disposable Windows host. Continue Kotlin sender only behind verified owned paired channel, no visible misleading connected status. Spotify/dots/DDC/P8 deferred.

---


## 2026-10-24 — Native sidecar with private bounded IPC and fake output only

**Branch/commit:** `feature/universal-gamepad`, the implementation commit containing this entry (look up HEAD SHA); baseline `d719b826a38113c49f81836f9aa50883aac6f3fa`. Previous [CI #40017943222](https://github.com/Farzansayeed/WinDock/actions/runs/40017943222) succeeded; latest published numbered [Preview v20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083).

**Code:** Added `native/gamepad-sidecar` .NET 8 persistent isolated stdin/stdout child with 256-byte byte-bounded protocol parsing and strict `ControllerReceiver` native watchdog/neutral lifecycle. It can run ONLY in explicit `--fake-sink-test` mode; normal invocation rejects without attaching any device. Added `scripts/test-gamepad-sidecar.mjs` subprocess checks and Windows CI build/test steps. No network listener, elevation, root certificate, licence, driver, production sink or phone networking.

**Exact test evidence at commit time:** previous-HEAD CI passed; new CI pending at [workflow](https://github.com/Farzansayeed/WinDock/actions/workflows/ci.yml). New Windows CI invokes `dotnet build native/gamepad-sidecar/WinDock.GamepadSidecar.csproj -c Release` and `node scripts/test-gamepad-sidecar.mjs`. Local .NET SDK unavailable, so these were **NOT RUN LOCALLY**. Actual Windows/Android hardware, virtual XInput/game support and true parent-crash/device-loss tests **NOT RUN**. Fake sink tests cannot certify hardware safety.

**Next:** review CI, add supervised owner-only Node launch lifecycle without enabling the production driverless /gamepad route. P2 legal/signed/offline/reversible hardware candidate remains unselected; seek explicit owner approval before privileged disposable Windows lab. Spotify, running dots, brightness and Touchpad P8 deferred.

---


## 2026-10-24 — End-of-session handoff, source status frozen

**Owner priority:** User asked to close, prepare next chat and preserve all information. Spotify remains BROKEN from WinDock on user's PC despite v16, although direct Spotify.exe works; owner explicitly deferred Spotify, brightness/DDC and running-dot issues to focus Gamepad P2/VS1.

**Verified:** published non-draft [v20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083), EXE + signed APK + SHA256SUMS/BUILD-INFO/SIGNING-INFO. [Preview Actions #40015513571](https://github.com/Farzansayeed/WinDock/actions/runs/40015513571), [multi-OS CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520) succeeded, and docs-only parent 5def46d [CI #40016195647](https://github.com/Farzansayeed/WinDock/actions/runs/40016195647) succeeded. This handoff commit is docs-only; new CI should be checked separately. No hardware controller, physical upgrade or gameplay acceptance was tested.

**Created:** [NEXT-SESSION.md](NEXT-SESSION.md) with exact frozen checkpoint, priorities/constraints/driver risk, optional read-only Windows baseline and paste-ready prompt; linked it from AGENTS and major docs and clarified P7/v20 summary. Historical entries preserved. Never ask for the owner's private JKS/secrets.

**Next:** Check live HEAD/Actions/releases, then continue safe P2 feasibility and persistent native fake-sink IPC toward VS1. No privileged Windows driver/cert change without explicit consent and rollback. P8 Touchpad tuning remains deferred.

---

## 2026-10-24 — Signed Gamepad Preview v20 published with P3/P4/P5 driver-neutral foundations

**Gamepad roadmap development milestone (2026-10-24):** [Gamepad Preview v0.2.3-gamepad.20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083) from source commit `c138083` was verified **non-draft/published** with Android Preview APK, Windows Preview installer, SHA256SUMS.txt, BUILD-INFO.txt and public SIGNING-INFO.txt. [Preview workflow #40015513571](https://github.com/Farzansayeed/WinDock/actions/runs/40015513571) passed Android unit/lint/APK/permanent signer, Windows installer smoke and publishing; [feature-branch multi-OS CI #40015513520](https://github.com/Farzansayeed/WinDock/actions/runs/40015513520) passed. It includes authenticated driver-neutral single-owner /gamepad WebSocket + strict state/replay/timeout checks, native .NET 8 independent real-timer fail-neutral fake report sink, and new Kotlin v1 stick+A full-state codec/JVM tests. **Production /gamepad upgrade intentionally returns 503 without real Xbox device backend; Gamepad remains local-only on Android, NOT usable in Windows games.** Real signed device + end-to-end hardware acceptance required.

**What passed:** Android full-state codec JVM tests, Android app Kotlin build/lint, Node authenticated WebSocket integration tests with in-memory sink, C# fake device receiver's real independent timer tests, Windows installer smoke, macOS/Linux/Windows CI and published non-draft release with correct assets and public signer info. **No** Windows driver, virtual XInput/controller in games, phone-to-Windows stick+A, authentic native report IPC or physical phone update was run.

**Driver gate:** Vendor documentation reviewed: HIDMaestro .NET10/UAC and machine-trust certificate installer; licensed libvirtualhid requires periodic online licence checks/offline limits; ViGEmBus retired. No backend chosen or installed. P2 proof/test on owner-controlled disposable Windows host with explicit consent and documented recovery is outstanding. Maintain the local/no-cloud runtime product requirement. Continue next code from P2 safety then VS1 integration.

**User priority:** Spotify launching and DDC are intentionally postponed at user's request and must not distract next chat unless re-requested. P8 Touchpad latency remains after Gamepad P7.

---

## 2026-10-24 — Kotlin Android full-state frame contract for stick+A

**Scope:** Added Android GamepadFrameEncoder.kt, pure Kotlin with exact protocol v1 ten-field full snapshot (seq, LX/LY signed stick, RX/RY zero, LT/RT zero, buttons A=0x1000), bounded axes, monotonic positive sequence and explicit neutral snapshot. This is a serializer only; no socket creation, app permissions, backend or virtual device. It does NOT misrepresent current local input preview as a PC controller. Sessions must start with a fresh codec, never silently wrap the sequence.

**Tests:** GamepadFrameEncoderTest.kt uses org.json in local JVM tests to verify complete frame shape, first and subsequent sequence numbers, analog bounds, neutral report, and simultaneous independent stick+A touch state. Build / Android CI pending at commit creation.

**Next:** P2 device backend approval and physically validated XInput creation; then bridge the native Android view to the authenticated /gamepad WebSocket with sound background/cancel neutral and native Windows IPC. Preserve existing WebView pairing and touchpad behavior.

---

## 2026-10-24 — P2 current signed XInput backend audit; no unsafe installation

**Primary sources verified:** [HIDMaestro official prerequisite and signing documentation](https://hidmaestro.org/docs/reference/driver-install-and-signing/) describes .NET 10, elevated driver creation and local self-signed certificate added to machine Root/TrustedPublisher; requires user review/rollback and cannot be silently enabled. [libvirtualhid Windows driver docs](https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md) claim production-signed AMD64 Windows 11 support and genuine XUSB Xbox 360 companion, but driver-backed device creation requires a paid machine licence and periodic online validation/offline restrictions; conflicts with the owner's wholly local gameplay expectations if not explicitly accepted. Retired ViGEmBus remains unmaintained and not a default shipping choice.

**Outcome:** No backend selected or installed and no purchasing, certificate trust or privileged action performed. Updated P2-DRIVER-FEASIBILITY.md with current source links, machine trust/licensing caveats, acceptance/rollback, and recommended isolated .NET 10 proof path (only after user approval). Read-only Windows probe already exists; native watchdog and authenticated server WebSocket are not a virtual device. **P2 BLOCKED until on-device approved test.**

**Next:** Build device-independent Native receiving/IPC and Kotlin report mapping without implying working games; after user consent, validate candidate on disposable Windows host with XInput baseline and fully documented signing+uninstall. Do not install machine root cert without explicit approval.

---

## 2026-10-24 — P4 independent PC-side timer fail-neutral receiver without driver

**Why:** A server-side inactivity timer is not sufficient to neutralize a stuck real Xbox device when Node crashes. Built native .NET 8 adapter-independent safety controller before driver choice.

**Source:** native/gamepad-tests/GamepadReceiver.cs (ControllerReceiver) owns explicit IControllerReportSink and a timer that runs independent of new phone/network packets. Writes neutral at initialization and on lease expiry, invalid frames, explicit Dispose, sink failure and idle no-first-frame; sends accepted strictly increasing full-state frames only. A lock serializes report writes with the timer, and the real backend must neutralize/remove a device from Dispose even if its final neutral report fails. Native class uses Stopwatch monotonic elapsed time by default; controller DLL/driver not installed, launched or bundled.

**Tests:** Extended native/gamepad-tests/Program.cs with in-memory sink and clock for valid state, replay drop, invalid fail neutral, expiry no revival, idle initial timeout, exactly-once backend cleanup, and REAL background timer expiry without Tick/frame calls. Existing CI already invokes this C# test project. No hardware verification yet; Github CI pending at commit time.

**Status:** P4 native in-process safety owner developed and testable, but NOT an OS virtual Xbox device or persistent transport subprocess. Next bridge authorized P5 gamepad socket to an actual native receiver IPC with native process-liveness safety, contingent on P2 supported licensed driver and physical PC tests. Original Touchpad input untouched.

---

## 2026-10-24 — Correct WebSocket route ownership exposed by CI

**Observed test failure:** npm CI on first /gamepad channel commit 86b21f21 failed with "server.handleUpgrade() was called more than once with the same socket." Existing src/sync.js dock-status upgrade listener accepted ALL paths except /input, so the new /gamepad listener and dock listener both upgraded one socket.

**Correction:** Limit read-only dock status upgrade to ONLY the root path "/". Existing /input listener owns ONLY /input and the new gamepad listener owns ONLY /gamepad. This also prevents accidental upgrades on other unknown paths, without weakening Origin/pairing checks. Keep the original connection tests plus real new gamepad test enabled in npm test.

**Verification:** Corrective npm/CI pending at commit time. Do not label P5 completed until it passes.

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
