/**
 * P2 signing + rollback evidence plan: PURE DATA REVIEW, NEVER authorization.
 * It does not read Windows registry, download vendor binaries, run installers,
 * spawn processes or touch driver/certificate/entitlement state.
 */
import { assessP2ReleaseEvidence } from "./p2-release-evidence.mjs";

const EXPECTED = Object.freeze([
  ["publisher-and-redistribution","public-documents",false],
  ["signed-package-claim","public-documents",false],
  ["offline-license-behavior","public-documents",false],
  ["compatibility-and-dependencies","public-documents",false],
  ["uninstall-and-shared-drivers","public-documents",false],
  ["vendor-package-acquisition","local-artifact-review",true],
  ["msi-and-file-signatures","local-artifact-review",true],
  ["driver-cat-inf-membership","local-artifact-review",true],
  ["installed-drivers-and-ownership","physical-trial",true],
  ["restore-and-interruption-plan","physical-trial",true],
  ["specific-install-authorization","physical-trial",true],
  ["device-and-fail-neutral-test","physical-trial",true],
  ["uninstall-and-restore-proof","physical-trial",true]
]);
const IDS=Object.freeze([
  ["hidmaestro-stable","RESEARCH_ONLY"],
  ["libvirtualhid-stable","RESEARCH_ONLY"],
  ["libvirtualhid-prerelease","DO_NOT_TRIAL"],
  ["vigembus-retired","DO_NOT_TRIAL"]
]);
function shape(value, keys){
  return value !== null && typeof value==="object" && !Array.isArray(value) &&
    Object.keys(value).length===keys.length && keys.every(key=>Object.hasOwn(value,key));
}

export function assessP2SigningRollbackPlan(plan,inventory){
  // Validate parent release metadata first: an altered hash or fabricated
  // evidence must NOT silently make this plan look independently verified.
  const releases=assessP2ReleaseEvidence(inventory);
  if(!shape(plan,["schemaVersion","reviewedOn","scope","ownerPermission","activationAuthorized","candidateReleases","checks"]) ||
    plan.schemaVersion!==1 || plan.reviewedOn!=="2026-10-25" ||
    plan.scope!=="OFFLINE_SIGNING_AND_ROLLBACK_PLAN_ONLY" ||
    plan.ownerPermission!=="NONPRIVILEGED_DOCUMENT_REVIEW_ONLY" ||
    plan.activationAuthorized!==false ||
    !Array.isArray(plan.candidateReleases) || plan.candidateReleases.length!==IDS.length ||
    !Array.isArray(plan.checks) || plan.checks.length!==EXPECTED.length)
    throw new TypeError("invalid P2 signing/rollback plan");

  const candidates=new Map();
  for(const c of plan.candidateReleases){
    if(!shape(c,["id","status"]) || candidates.has(c.id))
      throw new TypeError("invalid P2 plan candidate");
    const expected=IDS.find(([id])=>id===c.id);
    if(!expected || c.status!==expected[1])throw new TypeError("unsafe or unknown P2 candidate state");
    candidates.set(c.id,c.status);
  }
  if(IDS.some(([id])=>!candidates.has(id)) ||
      releases.some(r=>!candidates.has(r.id) || r.installAuthorized))
    throw new TypeError("P2 plan/inventory mismatch");

  const seen=new Set();
  for(const step of plan.checks){
    if(!shape(step,["id","stage","requiresSeparateApproval","requiredEvidence","status"]) ||
       typeof step.id!=="string" || seen.has(step.id) ||
       typeof step.requiredEvidence!=="string" || step.requiredEvidence.length<50 ||
       step.requiredEvidence.length>350 || step.status!=="NOT_CLEARED")
      throw new TypeError("invalid or falsely cleared P2 plan gate");
    const spec=EXPECTED.find(([id])=>id===step.id);
    if(!spec || step.stage!==spec[1] || step.requiresSeparateApproval!==spec[2])
      throw new TypeError("P2 privileged gate classification changed");
    seen.add(step.id);
  }
  if(EXPECTED.some(([id])=>!seen.has(id)))
    throw new TypeError("missing P2 plan gate");

  const stages=Object.freeze(EXPECTED.map(([id,stage,consent])=>Object.freeze({
    id,stage,requiresSeparateApproval:consent,cleared:false
  })));
  return Object.freeze({
    verdict:"STOP_REVIEW_ONLY",
    installAuthorized:false,
    driverSigningVerified:false,
    rollbackVerified:false,
    physicalXInputVerified:false,
    ownerConsentRecorded:false,
    uncleared:stages.length,
    stages
  });
}
