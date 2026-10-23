# P8 — Touchpad latency optimization (STRICTLY AFTER Gamepad v1)

**Status:** DEFERRED / NOT STARTED.  
**Added:** 2026-10-23 at user's request.  
**Scheduling:** Start **after P7 Gamepad release gates pass** and a usable Windows+Android gamepad is implemented, physically tested and packaged. Do **not** make gamepad P1–P7 dependent on P8, do not divert effort into mouse optimization while Windows virtual controller feasibility is unproven.

## Goal

Make WinDock's existing fullscreen **Touchpad** feel more immediate and consistent, especially pointer movement, tapping, scroll, pinch and drag, across Android Wi-Fi and USB tethering. Preserve input security, gestures, Signature canvas, remote keyboard, existing browser/PWA access and no-cloud operation.

## Existing source pipeline — audited as of 2026-10-23

```
Android phone's WebView/PWA PointerEvent
  → public/touchpad-gestures.js gesture model
  → public/input-pad.js motion() accumulation + requestAnimationFrame(flush)
  → authenticated WebSocket /input + JSON (maxPayload 8192)
  → Node src/input-hub.js validation, lease, WebSocket
  → src/platform/input.js persistent native helper stdin JSON
  → native/win/Touchpad.cs mouse/scroll SendInput
  → Windows desktop / target app
```

**Important:** The current bridge is *already persistent*; do not falsely say it spawns a helper for every mouse packet. Touchpad movement currently waits for a **requestAnimationFrame flush**, which coalesces movement to the rendering cadence; the Node/WebSocket portion may or may not be the bottleneck. Its 500ms heartbeat is for liveness, **not** its movement update interval. Measure before changing.

## Post-gamepad audit/checklist

- [ ] Capture baseline on physical Android+Windows phone/PC, using Wi-Fi and USB tethering (separate environments).
- [ ] Timestamp touch event (Android MotionEvent timestamp if native, browser event timestamp otherwise), JS handler, WebSocket send, Node receive, native stdin receive/SendInput, and cursor observability where measurable.
- [ ] Define real scope of timing and cross-device clock-synchronization method (RTT is not input-to-display delay). Measure p50/p95/p99, jitter, tail lag, stalls, packet loss, CPU/battery/heat and screen refresh mode.
- [ ] Check WebView pointer coalesced events, touch sampling and `requestAnimationFrame` quantization; compare immediate, paced or adaptive sends **without stalling visual feedback**.
- [ ] Measure existing `ws` backpressure threshold, buffering and node worker scheduling; evaluate WebSocket binary encoding only if measured JSON parsing/copying is material.
- [ ] Measure native helper stdin cost and Windows `SendInput` presentation cadence before contemplating a separate native transport.
- [ ] Test candidate `TCP_NODELAY`/socket options carefully if actually applicable, and verify no existing network stack settings already cover the need.
- [ ] Use lessons learned from shipped Gamepad state handling and diagnostics; **do not automatically reuse gamepad UDP**, since mouse deltas, scroll and ordered button edges behave differently from overwriteable full-state analog sticks.
- [ ] Preserve exact gesture semantics for tap, two-finger right-click, scroll, pinch, drag, speed slider, focus-aware keyboard and Signature.
- [ ] Test disconnect mid-drag, rapid Touchpad↔Gamepad switching, browser background, loss/reconnect, low-refresh phones and sudden USB tether/IP changes.
- [ ] Add regression tests and document measured before/after evidence. Never call an unmeasured refactor a latency improvement.
- [ ] Keep any native touchpad input acceleration optional with feature detection and safe browser/WebView fallback; no cloud dependency, no ADB requirement.

## Possible experiments (NOT commitments)

1. **Safer easy win:** replace render-frame-driven input flushing with an event-driven/coalesced cadence for pointer movement; preserve bounded rate and visual rendering independently. Compare rather than assume.
2. **Native phone path:** capture `MotionEvent` in Kotlin and forward compact relative pointer states while the current WinDock page owns navigation; much more complex because of WebView keyboard/focus and signature mode. Only if WebView input sampling is proven significant.
3. **Transport:** optimize existing WebSocket and persistent native helper first. If UDP is considered, specify ordered mouse button edge guarantees; **mouse relative deltas cannot simply be dropped as stale snapshots** without losing cursor motion.
4. **UI:** keep feedback visuals and network sending separated; avoid screen animations in the hot path and excessive background work.

**Promotion gate:** User has a stable Gamepad v1. P8 becomes active only by an explicit post-release development session. `PROGRESS.md` is the canonical tracker, and `WORKLOG.md` must contain baseline + actual measurements when undertaken.
