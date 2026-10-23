# Gamepad Preview — Updates, signing and next-chat handoff

**Repo:** https://github.com/Farzansayeed/WinDock
**Branch:** feature/universal-gamepad
**Status:** Windows/Android updater source committed; [multi-platform CI #39994885297](https://github.com/Farzansayeed/WinDock/actions/runs/39994885297) **passed**. Android APK unit/lint job passed from signing-enabled build; final prerelease and physical upgrade results still pending. No unattended installation.
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

Earlier APKs use ephemeral GitHub Actions debug signing, so Android might reject an update with a different signing key EVEN WHEN the APK checksum passes. CI now supports persistent signing with a dedicated keystore saved only as GitHub Actions repository secrets.

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
- [x] Optional stable Android private signing integration added in CI; owner secrets not yet configured.
- [x] Multi-platform GitHub CI passed updater code and Windows tests; Android packaging/JVM/lint job of previous signing-enabled commit passed. **Latest complete installable prerelease and physical update gates still open.**
- [ ] Check actual successful GitHub preview prerelease generated from this updater commit; don't invent a download.
- [ ] Owner configures the four signing secrets securely on GitHub.
- [ ] Test real PC update vN→vN+1: prompts, hash, installer starts, old process exits, settings persist.
- [ ] Test real Android update: consent, download, package installer, stable signing across two builds, preview data persists.
- [ ] Test no update, offline/API rate limit, broken checksum, malicious asset URL, download interrupted, cancelled prompt and older version.
- [ ] Keep main gamepad milestone separate: actual Windows XInput driver + Android→PC playable controller not yet complete.
- [ ] P8 Touchpad latency optimization remains strictly AFTER working Gamepad v1.

IMPORTANT: Source implementation is not proof of successful installation. Record exact branch/commit, OS/app version, test commands, GitHub Actions run results and blockers in PROGRESS.md and WORKLOG.md after every change.
