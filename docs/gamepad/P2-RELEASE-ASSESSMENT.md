# P2 vendor release identity and rollback assessment — 2026-10-25

**EVIDENCE ONLY. NO INSTALLATION, ELEVATION, DRIVER, CERTIFICATE TRUST, LICENCE PURCHASE, DOWNLOAD, OR SECURITY BYPASS AUTHORIZED.** This is a frozen read-only snapshot of vendor release data. Owner previously passed Windows v40 audit and v42 document acceptance, approved only the nonprivileged evidence review.

## Verified published release identities and metadata SHA-256

| Candidate | Channel | Windows x64 asset | GitHub published SHA-256 |
|---|---|---|---|
| [HIDMaestro v2.0.3](https://github.com/hifihedgehog/HIDMaestro/releases/tag/v2.0.3) | stable, Oct 22 | HIDMaestro-v2.0.3.zip | b1578a391971f4296026b692844292dfc55ddbddbeabc2bcada8cc36c6e34cd2 |
| [libvirtualhid v2026.914.1218.10](https://github.com/LizardByte/libvirtualhid/releases/tag/v2026.914.1218.10) | latest stable, Sep 14 | libvirtualhid-Windows-AMD64-driver-installer.msi | bc31539a41f71939c13decb171ccbd4306fae1fed63273434a4f5ceccaf3e71c |
| [libvirtualhid v2026.1022.2339.24](https://github.com/LizardByte/libvirtualhid/releases/tag/v2026.1022.2339.24) | newer prerelease, Oct 23 | same MSI name, different bytes | b667470b32e3f6e0d66893235693de008ab80863291053dbf89a7532d321ef18 |
| [ViGEmBus v1.22.0](https://github.com/nefarius/ViGEmBus/releases/tag/v1.22.0) | retired, Nov 2023 | ViGEmBus_1.22.0_x64_x86_arm64.exe | NOT PROVIDED by GitHub release asset metadata |

These SHA-256 values came from official GitHub release *metadata*, not downloaded files. No local hashes, Authenticode signing chains, trusted Windows driver catalogs or reversible installations were independently verified. Do not confuse a published SHA with code signing.

## Rollback and licensing blockers

**HIDMaestro v2.0.3:** Self-signed LocalMachine certificate trust and administrator rights are required according to [vendor signing guidance](https://hidmaestro.org/docs/reference/driver-install-and-signing/). In the [v2.0.3 release](https://github.com/hifihedgehog/HIDMaestro/releases/tag/v2.0.3), the optional usbip-win2-inclusive uninstall may remove a root-hub filter, restart USB 3 hubs, briefly disconnect devices, mark services for deletion at reboot, and affect other apps using usbip-win2. Its uninstaller's preview/rollback results are vendor Windows Sandbox evidence, NOT proof on this owner's machine. .NET 10 registry was not detected by the owner's earlier read-only audit.

**libvirtualhid:** The [Windows vendor instructions](https://github.com/LizardByte/libvirtualhid/blob/master/docs/windows-driver.md) claim a production-signed MSI but independent Authenticode verification has not happened. UMDF2 driver and broker installation require administrator permissions; paid machine licences are required to create virtual devices and license checks may require online contact. Vendor describes an offline limit of one retained active licensed device, with stricter yearly subscriptions. Windows 10 is best effort, and the Windows MSI/broker use LB-SAL, not the library's MIT licence. Service/driver removal and licence deactivation are not proven reversible here. Only AMD64 Windows installers are currently published.

**ViGEmBus:** Officially retired. v1.22.0 mentions a broken in-place upgrade path; no GitHub release SHA-256 is provided by the API. It is not a maintained WinDock deployment candidate.

## What the automated evidence gate does

The file docs/gamepad/P2-RELEASE-EVIDENCE.json records the pinned vendor release tags, hashes, rollback hazards and explicit NOT-VERIFIED flags. Run node scripts/p2-release-review.mjs from a repository checkout. The scripts/verify-gamepad-release-evidence.mjs oracle is included in npm test and asserts strict source identities, safe metadata boundaries, stable/prerelease distinction, hazard retention and that forged sign-off fields are rejected. It makes NO external web/API calls at runtime and never downloads or executes anything. Every candidate remains EVIDENCE_ONLY_NOT_INSTALL_APPROVED.

## Next step (separately approval-gated, not performed)

Assess any proposed single trial version's exact licence/redistribution terms, independently signed certificate/catalog verification in a safe permitted setting, full installed-device/USB filter ownership inventory, tested rollback/restoration approach and crash-neutral/game visibility plan. Seek separate, explicit, informed owner consent before touching any vendor executable, machine trust, admin rights or licence. Production gamepad remains disabled and real Xbox/gameplay unverified.

No repeat of prior Windows/Android/v40 physical tests is warranted.

## Nonprivileged next phase (owner v43 Proceed)

A complete signing, offline/licence and driver removal consent matrix is maintained at [P2-SIGNING-ROLLBACK-PLAN.md](P2-SIGNING-ROLLBACK-PLAN.md). All 13 checks remain NOT_CLEARED and the CLI `node scripts/p2-signing-rollback-review.mjs` cannot grant driver permission. No vendor executable may be acquired or run under this approval.

## 2026-10-25 Phase A tagged-license update

See [P2-PHASE-A-DECISION.md](P2-PHASE-A-DECISION.md) for legal source-tag evidence: libvirtualhid Windows MSI is not MIT and LB-SAL §3(b) prohibits third-party distribution absent separate permission. HIDMaestro's repository is MIT but its bundled third-party notices have not been inspected. The v2.0.3 release root-hub restart statement takes precedence as a safety caveat over the older generic removal page.
