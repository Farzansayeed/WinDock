# WinDock fork — development instructions

This fork is used to build **Universal Gamepad Mode** for the existing WinDock project. Read **`docs/gamepad/00-START-HERE.md`**, **`docs/gamepad/PROGRESS.md`** and **`docs/gamepad/WORKLOG.md`** before implementing gamepad work, plus the linked `01-UX-NAVIGATION.md`, `02-IMPLEMENTATION-ROADMAP.md`, `REQUIREMENTS-v2.md` for requirements. The legacy v1 document in `archive/` is superseded.

**Non-negotiable:** Gamepad is a mode inside existing **Touch & sign** input section; direct one-tap Touchpad ↔ Gamepad switching; selectable analog sticks (0/1/2), D-pad, ABXY, LB/RB, LT/RT, Menu/View with user local layouts. **No haptics**, **no gyro v1**. Android companion is Kotlin; no separate app. Prefer a native low-latency input path with native Windows virtual controller, while benchmarking rather than presuming Node is slow. Never leave pressed controls stuck on disconnect/exit.

Keep platform-provider boundary, pair/session security, local-only design, existing functionality and tests intact. Work in this user's fork only; do not open upstream issues or PRs without an explicit future request. Prefer incremental testable changes with honest functional status.

Run `npm test` and appropriate Windows, Android, Linux checks for touched code. Never commit PINs/cookies/credentials or personal device data.

## Mandatory progress maintenance (applies to all future coding sessions)

The **single canonical checklist** is `docs/gamepad/PROGRESS.md`; the chronological evidence log is `docs/gamepad/WORKLOG.md`. For **every meaningful code change or batch**, commit updates to both in the same commit, marking only verified tasks complete and recording date, changed files, tests actually executed and their outcome (or not run), blockers and the next concrete task. If the implementation changes the UI or architecture, update `UI-REFERENCE.md`, screenshots, `00-START-HERE.md`, and/or implementation docs as necessary. Never claim a working controller or low latency merely from a UI preview. These updates occur whenever a coding session changes the repo; **not asynchronously or automatically when nobody is working**. Do not edit the original upstream without an explicit instruction.
