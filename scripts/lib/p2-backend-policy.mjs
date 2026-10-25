/**
 * P2 virtual Xbox backend feasibility SCREEN, not a permission or installer.
 * Pure data: no filesystem, process creation, network, registry, drivers,
 * certificate-store mutation, PowerShell, license activation, or device IO.
 *
 * The owner must separately approve any privileged experiment. Never turn
 * this review result into permission, regardless of fields in a JSON file.
 */
const ENUMS = Object.freeze({
  driverSigning: ["production-signed", "local-self-signed", "unverified"],
  entitlement: ["no-licence-claim", "paid-machine-licence", "unverified"],
  offline: ["unconditional-verified", "claimed-unverified", "conditional", "unverified"],
  redistribution: ["confirmed", "restricted", "unverified"],
  rollback: ["verified", "documented-unverified", "unverified"],
  windows10: ["verified", "best-effort", "unverified"],
  xinput: ["vendor-claimed", "historical", "unverified"],
});
const CANDIDATE_KEYS = [
  "id", "source", ...Object.keys(ENUMS),
  "requiresElevation", "changesMachineCertificateTrust", "maintained",
];
export const P2_IDS = Object.freeze(["hidmaestro", "libvirtualhid", "vigembus"]);

/** Reject malformed, unknown, and forged "approved" declarations. */
export function validateP2Candidate(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate) ||
      Object.keys(candidate).length !== CANDIDATE_KEYS.length ||
      CANDIDATE_KEYS.some(key => !Object.hasOwn(candidate, key)))
    throw new TypeError("invalid P2 backend candidate schema");
  if (!P2_IDS.includes(candidate.id) ||
      typeof candidate.source !== "string" ||
      !candidate.source.startsWith("https://") ||
      candidate.source.length > 250 ||
      ["requiresElevation", "changesMachineCertificateTrust", "maintained"]
        .some(key => typeof candidate[key] !== "boolean") ||
      Object.entries(ENUMS).some(([key, values]) => !values.includes(candidate[key])))
    throw new TypeError("invalid P2 backend evidence");
  return candidate;
}

/** Returns review blockers. NEVER returns install authorization. */
export function assessP2Candidate(input) {
  const c = validateP2Candidate(input);
  const blockers = [];
  if (c.driverSigning !== "production-signed") blockers.push("driver-signing-not-production-verified");
  if (c.requiresElevation) blockers.push("requires-administrator-approval");
  if (c.changesMachineCertificateTrust) blockers.push("requires-machine-trust-change-approval");
  if (c.entitlement !== "no-licence-claim") blockers.push("entitlement-unresolved");
  if (c.offline !== "unconditional-verified") blockers.push("unconditional-offline-behavior-unverified");
  if (c.redistribution !== "confirmed") blockers.push("driver-redistribution-unconfirmed");
  if (c.rollback !== "verified") blockers.push("clean-rollback-unverified");
  if (c.windows10 !== "verified") blockers.push("owner-windows-compatibility-unverified");
  if (!c.maintained) blockers.push("driver-not-maintained");
  if (c.xinput !== "vendor-claimed") blockers.push("xinput-profile-not-currently-claimed");
  // Important: A perfect-looking manifest NEVER creates permission to
  // install, elevate, purchase a license, modify Root or enable /gamepad.
  blockers.push("separate-informed-owner-consent-required");
  return Object.freeze({
    id:c.id, decision:"BLOCKED_REVIEW_ONLY",
    installAuthorized:false, activatesGamepad:false,
    blockers:Object.freeze(blockers),
  });
}

export function assessP2Catalog(catalog) {
  const keys=["schemaVersion","reviewScope","reviewedOn","consent","candidates"];
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog) ||
      Object.keys(catalog).length !== keys.length ||
      keys.some(key => !Object.hasOwn(catalog,key)) ||
      catalog.schemaVersion !== 1 ||
      typeof catalog.reviewScope !== "string" || catalog.reviewScope.length > 300 ||
      typeof catalog.reviewedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(catalog.reviewedOn) ||
      catalog.consent !== "NO DRIVER INSTALLATION OR SECURITY CHANGE AUTHORIZED; JSON CANNOT GRANT CONSENT" ||
      !Array.isArray(catalog.candidates) || catalog.candidates.length !== P2_IDS.length)
    throw new TypeError("invalid or unauthorized P2 backend catalog");
  const ids=new Set(catalog.candidates.map(c=>validateP2Candidate(c).id));
  if (ids.size !== P2_IDS.length || P2_IDS.some(id=>!ids.has(id)))
    throw new TypeError("missing/duplicate P2 backend candidates");
  return Object.freeze(catalog.candidates.map(assessP2Candidate));
}
