# WinDock fork — development instructions

This fork is used to build **Universal Gamepad Mode** for the existing WinDock project. Read **`docs/gamepad/00-START-HERE.md`**, **`docs/gamepad/PROGRESS.md`**, **`docs/gamepad/AUDIT.md`** and **`docs/gamepad/WORKLOG.md`** before implementing gamepad work, plus the linked `01-UX-NAVIGATION.md`, `02-IMPLEMENTATION-ROADMAP.md`, `REQUIREMENTS-v2.md` for requirements. The legacy v1 document in `archive/` is superseded.

**Non-negotiable:** Gamepad is a mode inside existing **Touch & sign** input section; direct one-tap Touchpad ↔ Gamepad switching; selectable analog sticks (0/1/2), D-pad, ABXY, LB/RB, LT/RT, Menu/View with user local layouts. **No haptics**, **no gyro v1**. Android companion is Kotlin; no separate app. Prioritize a **signed/legally distributable Windows virtual XInput driver feasibility spike**, keeping in mind HIDMaestro .NET 10/admin/cert requirements vs existing .NET 8; benchmark the existing authenticated persistent-helper WebSocket route before adding UDP. After P1/P2, build a real one-stick + A Android-to-Windows vertical slice (VS1) before a sophisticated layout editor. Never leave pressed controls stuck on disconnect/exit.

Keep platform-provider boundary, pair/session security, local-only design, existing functionality and tests intact. Work in this user's fork only; do not open upstream issues or PRs without an explicit future request. Prefer incremental testable changes with honest functional status.

Run `npm test` and appropriate Windows, Android, Linux checks for touched code. Never commit PINs/cookies/credentials or personal device data.

## Mandatory progress maintenance (applies to all future coding sessions)

The **single canonical checklist** is `docs/gamepad/PROGRESS.md`; the chronological evidence log is `docs/gamepad/WORKLOG.md`. For **every meaningful code change or batch**, commit updates to both in the same commit, marking only verified tasks complete and recording date, changed files, tests actually executed and their outcome (or not run), blockers and the next concrete task. If the implementation changes the UI or architecture, update `UI-REFERENCE.md`, screenshots, `00-START-HERE.md`, and/or implementation docs as necessary. Never claim a working controller or low latency merely from a UI preview. These updates occur whenever a coding session changes the repo; **not asynchronously or automatically when nobody is working**. Do not edit the original upstream without an explicit instruction.

## Required audit gates

Consult [AUDIT.md](docs/gamepad/AUDIT.md). Do not select or bundle a Windows driver solely because its repository is MIT, self-reported fast, or advertises XInput; verify clean install/removal, elevation, signing/certificate trust, actual gamepad visibility, Windows target version, redistribution rights, and .NET runtime compatibility. Avoid elevating the existing WinDock Node host. Treat UDP as optional and security-sensitive until measurements prove it useful. Record decisions D1–D6, test evidence and next actions in PROGRESS/WORKLOG.

## External projects and future Touchpad performance

Read `docs/gamepad/OPEN-SOURCE-RESEARCH.md` for source-verified virtual gamepad comparisons, lessons and red flags. **Do not copy GPL/LGPL or uncertain-license code into this MIT fork without an explicit license compliance review**; distinguish author's benchmarks from our measured performance. The user requested faster Touchpad response **only after the full Gamepad v1 (P7) is implemented, physically tested and packaged**. Keep this as **P8 deferred** in `docs/gamepad/TOUCHPAD-LATENCY-P8.md`, not as a current feature or a dependency of Gamepad. Upon activation, baseline existing WebView→RAF→WebSocket→Node→persistent C# helper→Windows path and preserve relative cursor delta, scroll and release semantics. Update PROGRESS and WORKLOG for all changes.

## Mandatory prerelease and versioning discipline

The user needs **downloadable packages**, not just source code. Read docs/gamepad/INSTALL-PREVIEW.md. On code pushes, .github/workflows/gamepad-preview.yml builds an isolated Windows installer and separately identified Android preview APK. It publishes a GitHub **prerelease only when Windows/Android build and tests pass**. Tag, BUILD-INFO.txt and checksums must unambiguously identify run number + source commit. Do not claim a package exists until a successful workflow/release was checked. Never replace upstream WinDock installer/AppId/settings or present its release links as the fork's packages. Avoid committed Android signing secrets; debug preview APK updates may require uninstall. Preserve the preview channel while Gamepad is UI-only, and don't promote to stable without gamepad hardware testing. Update PROGRESS.md and WORKLOG.md with build/release status and actual evidence on each coding session.
