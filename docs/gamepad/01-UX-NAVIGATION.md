# Gamepad inside Touch & sign — UX / interaction specification

**Visual sources:** user-shared screenshots of WinDock (23 October 2026) showing (1) Signature page, (2) bottom dashboard glass drawer with “Touch & sign”, and (3) fullscreen dark grid Touchpad with bottom navigation and speed. A reduced-resolution contact sheet of the **actual user-provided screenshots** is now committed in [`assets/current-ui-screenshots.webp`](assets/current-ui-screenshots.webp) and embedded in [`UI-REFERENCE.md`](UI-REFERENCE.md). Use the images **and** the source files for visual accuracy.

## Existing visual hierarchy (preserve)

1. Bottom dashboard drawer: large translucent/dark-glass rounded sheet with `Apps | Controls | Capture | Touch & sign | Appearance | Arrange | Fullscreen`, followed by device and connection status.
2. Choosing **Touch & sign** enters an input modal (`#input-pad`). **Touchpad** is immersive/fullscreen, almost-black background with fine square grid, central instruction (“Tap to click · Two fingers to scroll · Pinch to zoom”), bottom-left Back/Signature/Keyboard controls, bottom-center Left click / Right click / Drag, bottom-right Speed.
3. **Signature** is a distinct top-tab interface with `Touchpad | Signature` tabs, close at top right, large centered ivory signature canvas reading “Make your mark.” and bottom Undo / Clear / Ink / Save to PC / Insert into PC.

## Requested new navigation (not a separate dashboard tile)

```
Dashboard
   └─ "Touch & sign"
        ├─ Touchpad  [default / existing fullscreen style]
        │    └─ bottom left: Back | Signature | Keyboard | GAMEPAD
        ├─ Signature [top tabs: Touchpad | Signature | Gamepad]
        └─ Gamepad   [native Kotlin phone view if possible]
             ├─ top or unobtrusive overlay: Touchpad shortcut | Edit | Profiles | Exit
             ├─ fullscreen landscape controller layout
             └─ one tap to Touchpad, *not* Dashboard
```

UI can use a third top tab **Gamepad** in non-immersive presentation. Ensure there is always a fast direct route from immersive Touchpad to Gamepad and back, even if the fullscreen Gamepad uses a native Android Activity over the WebView.

**Keep keyboard/signature controls and existing pointer functions functional.** Gamepad must not take over the current touchpad WebSocket or make its input state leak into games.

## Native Android navigation bridge

- Existing `MainActivity.kt` uses `@JavascriptInterface` with a trusted WebView page guard and dispatches events to/from the page.
- Add a narrowly scoped `openGamepad()` bridge callable only when the page is trusted/foreground and a real paired PC endpoint has been validated. Never accept arbitrary endpoint/secret/command arguments from the JS side.
- Enter native `GamepadActivity` or equivalent Kotlin view inside the existing WinDock APK; keep the current PC identity/pairing intact.
- Returning from native Gamepad restores the same `#input-pad` mode (Touchpad or Signature), not the drawer. The WebView does not forward every joystick frame.
- On device/driver lacking capability, show a clear in-context unsupported message, never simulate “connected controller” status falsely. Browser demo may show a **preview only**, visibly labeled preview.

## Selectable controls and editor

**Independent groups:** Left stick, Right stick, D-pad, A/B/X/Y, LB/RB, LT/RT, Menu/View. If only one stick is visible, choose logical left or right. Users may elect zero sticks.

- Normal mode: multitouch controls with large forgiving hit targets, game input enabled, landscape and screen awake.
- Edit mode: gameplay input **suspended and neutral**; drag groups, resize, set transparency, move boundaries safely, snap/align optional; Save/Cancel/Reset accessible.
- Save **local device profiles**; ship Full / Single Stick / Racing / Minimal examples; never silently sync through cloud.
- Hidden or deleted control always resolves to released/0 on next report; switching profile neutralizes prior state before applying.
- No controls for vibration, haptic feedback, gyro or motion aiming in v1.

## Design language

Match WinDock's current minimalist dark appearance: black/navy surface, subtle grid, muted blue/glass panels, delicate highlights and geometric simple outlines. Use luminous active states only when pressed and reduce visual clutter. Touch hit areas must be large enough despite the minimal icons. Respect cutouts/insets and narrow phones.

## UI acceptance checks

- Dashboard action remains “Touch & sign”.
- From Touchpad, one tap switches to Gamepad; from Gamepad, one tap switches to Touchpad with no dashboard detour.
- Signature remains reachable in no more than one or two taps.
- Closing input, app backgrounding, or phone orientation change releases all gamepad buttons and sticks.
- Single-stick, dual-stick, D-pad-only and face-buttons-only layouts can all be created.
- Buttons can be pressed simultaneously (e.g. hold LB + use right stick + tap A).
- An unavailable PC controller driver is not misrepresented as active.
