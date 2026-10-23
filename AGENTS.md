# WinDock fork — development instructions

This fork is used to build **Universal Gamepad Mode** for the existing WinDock project. Read **`docs/gamepad/00-START-HERE.md`** before implementing gamepad work and the linked `01-UX-NAVIGATION.md`, `02-IMPLEMENTATION-ROADMAP.md`, `REQUIREMENTS-v2.md` for requirements. The legacy v1 document in `archive/` is superseded.

**Non-negotiable:** Gamepad is a mode inside existing **Touch & sign** input section; direct one-tap Touchpad ↔ Gamepad switching; selectable analog sticks (0/1/2), D-pad, ABXY, LB/RB, LT/RT, Menu/View with user local layouts. **No haptics**, **no gyro v1**. Android companion is Kotlin; no separate app. Prefer a native low-latency input path with native Windows virtual controller, while benchmarking rather than presuming Node is slow. Never leave pressed controls stuck on disconnect/exit.

Keep platform-provider boundary, pair/session security, local-only design, existing functionality and tests intact. Work in this user's fork only; do not open upstream issues or PRs without an explicit future request. Prefer incremental testable changes with honest functional status.

Run `npm test` and appropriate Windows, Android, Linux checks for touched code. Never commit PINs/cookies/credentials or personal device data.
