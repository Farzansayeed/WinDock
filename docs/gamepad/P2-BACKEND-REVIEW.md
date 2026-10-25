# P2 — Local-only virtual Xbox backend evidence screen (NO INSTALL)

**Owner context:** Real Windows x64 `10.0.26300.0` read-only v40 audit and hash both **PASS**. Three named public certificate indicators `not_detected`; x64 registered .NET 10 shared runtime `not_detected`. These are observations, not authorization or proof of driver absence. The user expressly approved only **driver-neutral development**. See [feasibility](P2-DRIVER-FEASIBILITY.md) and [progress](PROGRESS.md).

## Purpose

`docs/gamepad/P2-BACKEND-CANDIDATES.json` records current public-vendor evidence for HIDMaestro, libvirtualhid and ViGEmBus in a **closed schema**. It is deliberately not an installer manifest and contains no binaries, download code, local device details, credentials, machine certificate material or owner consent.

Run from a repository checkout:

```sh
node scripts/p2-backend-review.mjs
```

No Windows machine is required. Output is a **BLOCKED_REVIEW_ONLY** summary with explicit reasons. CI runs `scripts/verify-gamepad-backend-policy.mjs` on Linux, macOS and Windows; unit tests inject malformed/manipulated candidates and verify they fail closed, and even a hypothetical ideal candidate always requires informed owner approval **outside** the repository. Nothing in this screen can activate `/gamepad`, install a driver, elevate, enable test-signing, trust a certificate or purchase an entitlement.

## Evidence and unknowns (checked 2026-10-25)

| Backend | Vendor documentation | What still blocks even a trial |
|---|---|---|
| HIDMaestro 2.x | [Signing](https://hidmaestro.org/docs/reference/driver-install-and-signing/) | Local self-signed machine Root/TrustedPublisher and private-key storage, elevation, unverified rollback, unverified offline/XInput compatibility on owner's exact build, unverified driver redistribution. .NET 10 shared-runtime registry was not detected, which does not rule out isolated self-contained use |
| LizardByte libvirtualhid | [Windows package](https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md) | Paid Windows licence, restrictions on continued offline use, Windows 10 best-effort support, redistribution conditions, elevation for driver installation and physical rollback |
| ViGEmBus | [Archived project](https://github.com/nefarius/ViGEmBus) | No maintained distribution baseline. Do not choose it for unattended installation |

Vendor claims do not establish independently verified Windows device visibility, game compatibility, signing acceptance by the owner, clean uninstall or device-neutral behavior after native crash. An acceptable approved driver integration would require real Windows x64 tests with explicit owner permission and a separate rollback plan.

## What is and is not decided

- **Decided:** All current options remain blocked from installation; future evidence may change candidate review results. The real virtual Xbox P2 milestone is **NOT COMPLETED**.
- **Not decided:** No backend selection, vendor binary acquisition, licence purchase, elevation, certificate installation or trust override. No trial authorized.
- **Next review-only step:** assess exact vendor release version/checksum, published licence/redistribution and uninstall impact, and independently confirm accepted signing and unconditional offline requirements. Prepare a transparent rollback and failure-test plan for a separately consented lab trial. No WinDock production route changes until physical game output is verified.

**The user's already accepted Windows XInput 0/4 baseline, Preview install/start, Android v25 tests and v40 backend audit remain PASS and do not need repeating.**

## 2026-10-25 pinned vendor releases

See [P2-RELEASE-ASSESSMENT.md](P2-RELEASE-ASSESSMENT.md) for exact release channels, GitHub asset digest metadata, USB-hub restart and rollback hazards; see [JSON evidence](P2-RELEASE-EVIDENCE.json). Nothing has been downloaded, verified locally or approved for installation.
