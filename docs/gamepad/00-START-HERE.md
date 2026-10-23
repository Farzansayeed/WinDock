# WinDock Universal Gamepad — START HERE

**Canonical fork:** https://github.com/Farzansayeed/WinDock
**Work branch:** `feature/universal-gamepad`
**Upstream:** https://github.com/aliihsaad/WinDock
**Plan recorded:** 23 October 2026
**Status as of this commit:** planning and handoff documentation. No virtual controller, native Android gamepad, or game input transport has been implemented/tested yet.

## Why this exists

Add an optional **Gamepad** input mode to the **existing** WinDock Android companion and Windows PC host. The phone should act as a configurable physical-gamepad-like virtual Xbox-compatible controller in supported PC games, not merely keyboard WASD/mouse emulation. The user wants rapid **Touchpad <-> Gamepad** switching without going back to the dashboard. All project work is in the **user's fork only**; do not create an upstream PR or issue unless subsequently requested.

## Non-negotiable product decisions

- Keep the dashboard action **Touch & sign**; Gamepad lives in this same input section, **not** as a separate main dashboard tile.
- The input space offers **Touchpad | Signature | Gamepad**. Touchpad remains fullscreen with existing bottom controls, and gains an obvious Gamepad shortcut beside its existing back/signature/keyboard navigation. Gamepad has a direct return-to-Touchpad action. Switching stops and neutralizes the previous mode; stay within the same input surface.
- Every control group can be selected: 0/1/2 analog sticks (1 stick can represent logical left or right), D-pad, ABXY, LB/RB, LT/RT, Menu/View. L3/R3 optional. Groups can be placed/resized; profiles stored locally; never require all controls on screen.
- No haptics/rumble/phone vibration/adaptive triggers. **No gyroscope initially**; revisit only after normal controls pass real-device validation.
- Latency matters; use direct native Kotlin `MotionEvent` capture and a long-lived native PC receiver, benchmark UDP (gameplay data plane) against existing Node/WebSocket route before claiming gains. Node remains viable for discovery/pairing/control plane.
- First Windows controller mode: virtual Xbox 360/XInput if legally/deployment viable. PlayStation *visual labels* are not equivalent to a native DualSense. Driver viability must be researched, tested and documented; don't assume an archived or licensed driver is free/redistributable.
- Local-only Wi-Fi or USB tethering; no accounts/cloud/telemetry. Existing input, signing, capture, discovery and pairing must not regress.
- Force all controls neutral immediately on mode switch, app background, disconnect, timeout, or native receiver failure. A stuck throttle/trigger is unacceptable.

## Existing source integration map

| Area | Verified files |
|---|---|
| Input modal and navigation | `public/index.html` |
| Input selection, Touchpad/Signature lifecycle | `public/input-pad.js` |
| Main drawer action wiring | `public/app.js` |
| Fullscreen touchpad and signature styles | `public/style.css` |
| Android Kotlin trusted WebView activity/keyboard bridge | `android/app/src/main/java/com/windock/app/MainActivity.kt` |
| Existing paired LAN host | `server.js`, `src/auth.js`, `src/input-hub.js` |
| Native helper lifecycle | `src/platform/input.js`, `src/platform/windows.js` |
| Windows C# helper | `native/win/Program.cs`, `native/win/Touchpad.cs` |
| Existing tests and CI | `scripts/verify-input.mjs`, `test/run.mjs`, `.github/workflows/ci.yml` |

## Read next (in order)

0. **[PROGRESS.md — live checklist, done/next/blocked](PROGRESS.md)** and **[WORKLOG.md — chronological updates](WORKLOG.md)**

1. [Visual reference — actual current UI screenshots](UI-REFERENCE.md)
2. [01 — UX and screenshot-derived navigation](01-UX-NAVIGATION.md)
3. [02 — Implementation, security, testing and milestones](02-IMPLEMENTATION-ROADMAP.md)
4. [Full low-latency v2 technical handoff](REQUIREMENTS-v2.md) — authoritative detailed baseline except later changes above
5. [Archived initial requirements](archive/INITIAL-PROPOSAL-v1.md) — historical only; includes rejected ideas; **not** current requirements

## Project progress and continuous handoff

**[Open the live implementation checklist](PROGRESS.md)** (P0–P7, what's done, what is next, blockers, tests and milestone gates). For chronological decisions and commit-by-commit evidence, see **[WORKLOG.md](WORKLOG.md)**.

At the last documented status, **P0 planning/references are complete; P1 navigation/UI-preview implementation is next**. No working gamepad or real latency measurement has been verified. The tracker takes precedence over this snapshot. Each code batch must update PROGRESS and WORKLOG in its commit; refer to `AGENTS.md`.

## What is finished and what is not

- [x] User fork verified writable; development branch created.
- [x] Requirements and navigation agreed; full plans committed in these docs.
- [ ] Gamepad mode UI/UX implemented in repo.
- [ ] Android native multitouch custom layout editor and storage implemented.
- [ ] Secure PC session negotiation and native input transport implemented.
- [ ] Virtual controller driver chosen, integrated and licensed for distribution.
- [ ] Physical Windows/Android testing, game compatibility, measured latency, CI verification.
- [ ] Builds/releases generated.

## Continue in a fresh ChatGPT/Codex chat

> Work on https://github.com/Farzansayeed/WinDock, branch `feature/universal-gamepad`. First read `docs/gamepad/00-START-HERE.md`, **`PROGRESS.md`** and **`WORKLOG.md`**, `UI-REFERENCE.md`, `01-UX-NAVIGATION.md`, `02-IMPLEMENTATION-ROADMAP.md` and `REQUIREMENTS-v2.md`. Update the checklist and worklog with every code batch, including testing evidence and the next action. Do not ask me to repeat this brief. Implement incrementally on **my fork only**, preserve original features, write tests, and clearly separate a visual prototype from working virtual-controller support. Do not introduce haptics or gyroscope in v1, and do not open a PR to the original project.
