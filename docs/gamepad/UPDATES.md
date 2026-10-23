# Gamepad Preview — Updates, signing and next-chat handoff

**NEXT SESSION (2026-10-24):** [NEXT-SESSION.md](NEXT-SESSION.md) is the current frozen handoff, verified Preview [v20](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.20-gc138083), P2 signed/offline Xbox driver blocked, P3/P4/P5 driver-neutral CI done, live PC gamepad NOT functional. **Spotify still fails from WinDock and user has deferred Spotify/DDC/dot issues**. Historical notes below may be older; do not mistake v5/v11/v16 for latest.

**Repo:** https://github.com/Farzansayeed/WinDock
**Branch:** feature/universal-gamepad
**Status:** [Gamepad Preview build #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) and [CI #39998130774](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) **PASSED**. The Android signer was confirmed to match the private keystore and [v11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e) was published with public SIGNING-INFO.txt. **No physical Android in-place update has been tested yet.** No unattended installation.
**Scope:** update checks/downloads require internet to GitHub. Gamepad networking and pairing remain local Wi-Fi/USB tether.

## End-user steps

Windows: Right-click the WinDock Gamepad Preview tray icon; select Check for Gamepad Preview updates. If a newer fork preview exists, approve download. Windows fetches the expected installer, checks GitHub's published SHA-256 asset digest and byte size, asks again, starts the Windows Inno Setup wizard and exits the old preview tray to release its files. Windows setup/security warnings and the user's confirmation still apply. The original WinDock app is unaffected.

Android: Preview app → Phone options → Check for Gamepad Preview updates. A newer version causes a Yes/No dialog. After consent, the APK downloads over HTTPS, is SHA-256/size verified, checked for preview application package identity, and presented to the Android system installer after another confirmation. Android may require allowing unknown app installs for the preview. Android signature verification and explicit system installer approval are NEVER bypassed.

## Trusted metadata policy

- Lookup: https://api.github.com/repos/Farzansayeed/WinDock/releases?per_page=30
- Only published, non-draft GitHub prereleases with gamepad-vX.Y.Z-gamepad.RUN-gSHA7 tags.
- Only strictly higher numeric installed versions; never downgrade.
- Exact expected asset filename: WinDockGamepadPreviewSetup.exe on Windows, WinDockGamepadPreview-Android.apk on Android.
- Exact download URL must belong to the SAME fork release tag, with plausible published size and SHA-256 digest.
- Hash and byte count must match before launching installation. Reject malformed metadata, redirects to non-HTTPS final URL, unexpected assets, interrupted downloads and tampering.
- GitHub digest attests asset bytes against GitHub release metadata; it is not independent package signing. The Windows installer remains unsigned/experimental.
- Never use upstream aliihsaad/WinDock releases, the upstream Vercel update manifest, third-party LAN host metadata, or an arbitrary URL.
- No passwords, PINs, cookies, private keystores, GitHub tokens or user configuration in commits/logs.
- Never silently install, alter Android system signature policy, or elevate the regular WinDock Node server.

## Stable Android preview signing — required for smooth upgrading

Earlier APKs used ephemeral GitHub Actions debug signing, so Android may reject an update from a new signing key EVEN WHEN the APK checksum passes. The owner **reported adding all four GitHub Actions repository secrets** (2026-10-23); the new preview workflow now REQUIRES them, fails if any is absent, and verifies the APK's public signer certificate SHA-256 against the keystore certificate. It publishes SIGNING-INFO.txt with the public fingerprint. **Do not claim this was verified until a fresh Actions run and GitHub release succeeds.**

Owner setup:
1. On a trusted computer with Java JDK, run:
   keytool -genkeypair -keystore windock-gamepad-preview.jks -alias gamepadpreview -keyalg RSA -keysize 3072 -validity 3650
2. BACK UP the private .jks and its passwords securely offline. Never commit it and never paste it into ChatGPT.
3. In fork Settings → Secrets and variables → Actions, add four repository secrets:
   WINDOCK_PREVIEW_KEYSTORE_BASE64 : Base64 encoding of the full JKS bytes on one line
   WINDOCK_PREVIEW_STORE_PASSWORD : password for the JKS
   WINDOCK_PREVIEW_KEY_ALIAS : alias such as gamepadpreview
   WINDOCK_PREVIEW_KEY_PASSWORD : password for that alias's private key
4. The GitHub Actions preview workflow loads these secrets only on the runner, decodes the keystore privately and signs preview APKs with the SAME key for future builds. If any secret is missing, it falls back to ephemeral debug signing.
5. First switch to stable signing: uninstall ONLY the older Gamepad Preview APK once because its prior signing key differs. This resets only preview-local data. Regular WinDock remains untouched.
6. Test two consecutive new builds signed by that same key: Android must allow in-place upgrades after standard system installer confirmation and preserve preview data. Until physical testing, seamless upgrade remains unverified.

The user must do the secret setup in GitHub; the assistant cannot generate/store/share a private signing key on the user's behalf. Never show a keystore or credentials in chat.

## Implementation code map

Windows:
- native/tray/PreviewUpdates.cs — fork-specific release tag/version/asset allowlist, hash and file size verification
- native/tray/Program.cs — manual tray menu, 2 approval prompts, download and installer launch, tray exit; GAMEPAD_PREVIEW only
- native/update-tests/Program.cs — Windows release fixture tests

Android:
- android/app/src/main/java/com/windock/app/GamepadPreviewUpdates.kt — preview release query, download verification and Android system install Intent
- android/app/src/main/java/com/windock/app/PhoneOptions.kt — check updates button
- android/app/src/main/java/com/windock/app/MainActivity.kt — starts check from preview phone settings
- android/app/src/debug/AndroidManifest.xml and android/app/src/main/res/xml/update_paths.xml — FileProvider and request-install permission for debug preview
- android/app/src/test/java/com/windock/app/GamepadPreviewUpdatesTest.kt — manifest/version/asset parser regression tests
- android/app/build.gradle and .github/workflows/gamepad-preview.yml — optional stable signing via repository secrets

Continuation:
- docs/gamepad/00-START-HERE.md — starting guide
- docs/gamepad/PROGRESS.md — checklist and next task
- docs/gamepad/WORKLOG.md — chronological changes/test evidence
- docs/gamepad/INSTALL-PREVIEW.md — beginner download/update steps
- AGENTS.md — mandatory continuity and documentation rules

## Acceptance gates / next developer tasks

- [x] Windows fork-only release parser and hash-verifying download/install consent source added; fixture tests added.
- [x] Android fork-only release check, hash-verifying APK download, FileProvider and Android system installer handoff source added.
- [x] User configured all four permanent Preview signing GitHub Actions secrets; [v11 Actions build](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) verified the APK signer public certificate matches the private keystore certificate. No secret values accessed.
- [x] v11 Windows installer smoke, Android build/JVM/lint, permanent APK signer match and release publishing passed [Actions](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) and [CI](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774). Physical upgrades remain untested.
- [x] Verified non-draft [Preview v11 prerelease](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e) with Windows installer, Android APK, SHA256SUMS, BUILD-INFO and PUBLIC SIGNING-INFO.
- [x] Owner reported all four GitHub Actions secrets configured; signer was checked successfully during release build. Never request private JKS/passwords.
- [ ] Test real PC update vN→vN+1: prompts, hash, installer starts, old process exits, settings persist.
- [ ] Test real Android update: consent, download, package installer, stable signing across two builds, preview data persists.
- [ ] Test no update, offline/API rate limit, broken checksum, malicious asset URL, download interrupted, cancelled prompt and older version.
- [ ] Keep main gamepad milestone separate: actual Windows XInput driver + Android→PC playable controller not yet complete.
- [ ] P8 Touchpad latency optimization remains strictly AFTER working Gamepad v1.

IMPORTANT: Source implementation is not proof of successful installation. Record exact branch/commit, OS/app version, test commands, GitHub Actions run results and blockers in PROGRESS.md and WORKLOG.md after every change.

**Future-chat source of truth:** [SESSION-HANDOFF.md](SESSION-HANDOFF.md) covers the current verified signing milestone, remaining physical upgrade tests and the full next-chat code map.

## Latest signing-proof rule (2026-10-23)

The user's four GitHub Actions secrets have reportedly been configured (do NOT request their private values). The new workflow must produce **SIGNING-INFO.txt**, containing the **public** Android signer-certificate SHA-256, after checking it matches the keystore's public certificate. Never put the secret keystore/password into release assets, logs or chat. The preview publish job must include SIGNING-INFO.txt; a failed signing check means no new installer/APK prerelease. To verify future in-place upgrades, compare public SHA-256 certificate digests in two consecutive signed Preview releases and test on a physical Android device. Merely saving GitHub secrets or seeing a green CI workflow does NOT prove an APK upgrade works.

## Signing setup result verified — 2026-10-23

**Permanent signing verified on 2026-10-23:** The owner reported configuring all four private signing secrets, and the [Gamepad Preview build #39998130556](https://github.com/Farzansayeed/WinDock/actions/runs/39998130556) **passed**: Android's "Require and load dedicated stable Android preview signing key", "Build numbered APK, unit tests and lint", and "Confirm APK was signed by the permanent preview key" all succeeded; Windows build/installer smoke and prerelease publishing also succeeded. **[Gamepad Preview 0.2.3-gamepad.11](https://github.com/Farzansayeed/WinDock/releases/tag/gamepad-v0.2.3-gamepad.11-g175942e)** from commit `175942e` is published with both installers, SHA256SUMS.txt, BUILD-INFO.txt, and **SIGNING-INFO.txt**, which contains only the PUBLIC signer-certificate fingerprint. [Multi-platform CI #39998130774](https://github.com/Farzansayeed/WinDock/actions/runs/39998130774) also passed. **First in-place upgrade on physical Android phone not yet tested**; existing ephemeral-debug APK may require one-time uninstall of ONLY the Preview app.

**Next physical test:** First install v11 on the owner's phone and PC. If an older Gamepad Preview APK was signed with a different ephemeral key, uninstall ONLY the older Preview APK first (the regular WinDock app remains separate). Test Android's new Phone options → Check for Gamepad Preview updates and Windows tray → Check for updates. A second release from the same stable key must have the identical PUBLIC signer SHA-256 in SIGNING-INFO.txt and install over v11 after Android's normal user confirmation; record whether app data survives. Keep the JKS securely backed up offline, never in GitHub or chats.
