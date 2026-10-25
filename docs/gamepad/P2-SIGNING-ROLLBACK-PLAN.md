# P2 signing and rollback verification gates — plan only

**Current scope:** October 25, 2026. Owner **PASS** on the v43 release-evidence document, observations `none`, and expressly requested only a **strictly non-privileged plan**. No permission for acquiring vendor executables, installing any driver, elevation, adding certificate trust, bypassing Windows protections, contacting licence servers or making a purchase. The accepted Windows 10.0.26300.0 x64 baseline (0 XInput devices), v40 audit and Android v25 results remain accepted; do **not** repeat.

The machine-readable [gate inventory](P2-SIGNING-ROLLBACK-GATES.json) plus [frozen release evidence](P2-RELEASE-EVIDENCE.json) can be reviewed without changing the user's machine:

```sh
node scripts/p2-signing-rollback-review.mjs
```

The command uses local JSON only: **13 NOT_CLEARED checks, verdict STOP_REVIEW_ONLY**. Its validator and mutation tests are included in the main `npm test` suite; they reject a forged "PASS", tampered release metadata, unauthorized driver trial, or weakening of an approval-dependent gate. A reported "PASS" in a documentation-review checklist means the **plan is correctly restrictive**, not that Windows driver signing/rollback has been verified.

## Phase A — documentation and legal preflight (read-only; no vendor binaries)

| Requirement | What counts as sufficient review evidence |
|---|---|
| Publisher and redistribution | Exact Windows driver, SDK and broker licence clauses permitting WinDock's intended packaging, including any per-machine activation and redistribution restrictions. MIT on an API library does not cover an LB-SAL driver |
| Signing model | Vendor-stated release signature type: Microsoft or publisher-signed vs machine-local self-signed; list machine stores and driver catalog requirements. A GitHub-published SHA-256 verifies neither authenticity of a locally downloaded copy nor acceptance of a Windows driver signer |
| Offline autonomy | Written evidence for first activation, new controller creation, sustained XInput operation, reconnection and reboots with the network unavailable indefinitely. A lifetime licence with one offline device is a limitation, not proof of unrestricted offline use |
| Compatibility and dependencies | Owner Windows 10.0.26300.0 x64, profile truly visible to XInput, .NET 10 needs for HIDMaestro, app process isolation, driver architecture and reboot prerequisites |
| Shared driver ownership and removal | HIDMaestro 2.0.3's optional usbip-win2 cleanup, ownership checks, possible USB 3 root-hub restarts, unplugged peripherals, deferred deletion/reboots, and effects on DS4Windows or other clients |

**Stop if** the publisher's Windows driver terms forbid planned distribution, offline operation requires unacceptable network/licensing constraints, or signing requires an unwanted machine trust change. No selection is approved at Phase A.

## Phase B — strictly separate consent for package acquisition and **read-only artifact verification**

**NOT AUTHORIZED NOW.** If the owner later explicitly approves a particular vendor binary's acquisition and read-only inspection on an isolated system, preserve the release URL, tag and publisher SHA in [the pinned release assessment](P2-RELEASE-ASSESSMENT.md). Hash the actual downloaded bytes and compare to published metadata. Inspect the MSI/EXE's signature and publisher using Windows' read-only signature verification. If a driver catalog exists, check its trust chain and its INF/driver-file membership with a suitable SignTool verification policy on a normal, locked-down machine. Verify timestamp, signing policy, publisher identity and revocation behaviour; do not assume a signed outer MSI proves that embedded CAT/INF or installed driver will be accepted.

Microsoft documents `signtool verify /v /pa <file.cat>` for a release catalog and `signtool verify /v /pa /c <file.cat> <driver-file>` for catalog membership. Different driver trust policies may require different verification flags; exact commands must be matched to the actual package, OS and installed signing tool. See [Microsoft catalog verification](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/verifying-the-signature-of-a-catalog-file-signed-by-a-commercial-relea) and [catalog-file rules](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/catalog-files). These are **illustrative future verification checks, not commands to execute now**.

**Stop if** a digest mismatches, signature invalid or untrusted, dependencies unknown, or any test requires adding a root certificate, test signing, Secure Boot changes, permissions bypass, driver staging or activation. Do not run a vendor "uninstall --preview" utility until its behaviour is reviewed and the owner separately agrees; an argument named `--preview` is not proof of safety.

## Phase C — separate, explicit, informed physical installation/rollback trial

**NOT AUTHORIZED NOW.** Even after Phase B, a distinct exact-version owner approval is required. First establish a realistic recovery method, physical/remote keyboard and mouse access, whether USB peripherals could disconnect, current ownership of usbip-win2 host-controller/filter/services, and expected Windows restart requirements. Define an abort switch and independent neutral watchdog in the test design. Then, and only with explicit separate consent, consider an isolated test: install signed driver; check XInput visibility, stick+A, focus loss, phone unplug, sudden native helper death and immediate neutral; remove and verify absence of all *owned* device nodes, packages, services, certificates, scheduled tasks and filter bindings while preserving other applications. Take before/after inventories without publishing unique device IDs or credentials.

**HIDMaestro-specific stop:** Vendor [v2.0.3 release](https://github.com/hifihedgehog/HIDMaestro/releases/tag/v2.0.3) warns that `--include-usbip` may restart USB 3 hubs and briefly disconnect attached devices; a removal can remain pending reboot, and a shared usbip controller/filter may belong to another program. Do not blindly remove shared drivers.

**libvirtualhid-specific stop:** [Windows driver docs](https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md) describe a broker, Windows 10 best-effort support, licensed creation and conditional offline operation. A driver with a commercial signing claim is **not** automatically feasible for a completely offline/no-purchase WinDock.

**ViGEmBus and libvirtualhid prerelease:** Current plan marks both `DO_NOT_TRIAL`. All four pinned releases remain in the evidence inventory to avoid silent substitutions; none is approved for installation.

## Gate decision

This plan alone cannot pass **any** signing or rollback check. It explicitly requires a new and separate owner decision before obtaining vendor binaries, and another approval before any privileged machine experiment. Repository documents, green CI, previous read-only diagnostics and a "Proceed" to additional **driver-neutral** analysis do not authorize a driver trial.

**Physical Xbox and PC gameplay remain UNVERIFIED; production `/gamepad` stays HTTP 503.** The only owner action for this checkpoint is reviewing this plan, not touching a Windows or Android device.

## Phase A 2026-10-25 finding

See [P2-PHASE-A-DECISION.md](P2-PHASE-A-DECISION.md): libvirtualhid Windows MSI is source-available LB-SAL not MIT; redistributing requires separate publisher permission; HIDMaestro repository MIT alone does not resolve bundled third-party notices and self-signed machine trust. Uninstaller generic documentation conflicts with the v2.0.3 filter-removal release note. All 13 installation-related validation gates remain NOT_CLEARED.
