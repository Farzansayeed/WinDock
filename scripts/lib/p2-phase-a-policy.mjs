/**
 * P2 documentary deployment-viability matrix.
 * Cross-checks pinned release identities and refuses forged permission.
 * PURE FUNCTIONS ONLY — no vendor-binary download, disk, network, install,
 * Windows API, certificate store, licence, device or child-process access.
 */
import { assessP2ReleaseEvidence } from "./p2-release-evidence.mjs";

const DECISIONS = Object.freeze({
 "hidmaestro-stable":Object.freeze({
  tag:"v2.0.3",disposition:"RESEARCH_ONLY_TRUST_BLOCKED",
  license:"MIT_REPOSITORY_THIRD_PARTY_UNREVIEWED",redistribution:"NOT_CLEARED",
  signing:"LOCAL_SELF_SIGNED_MACHINE_TRUST_CHANGE",
  offline:"VENDOR_CLAIM_NOT_PHYSICALLY_VERIFIED",
  rollback:"CONFLICTING_VENDOR_DOCUMENTATION",
  primaryBlocker:"machine-certificate-trust-change",
  sourceHosts:["github.com","hidmaestro.org"],
  minSources:4
 }),
 "libvirtualhid-stable":Object.freeze({
  tag:"v2026.914.1218.10",disposition:"LICENCE_REDISTRIBUTION_BLOCKED",
  license:"LB_SAL_WINDOWS_MSI_NOT_MIT",
  redistribution:"PROHIBITED_WITHOUT_SEPARATE_PERMISSION",
  signing:"VENDOR_PRODUCTION_SIGNED_CLAIM_UNVERIFIED",
  offline:"LICENCE_DEPENDENT_ONLINE_CHECKS",
  rollback:"BROKER_DRIVER_REMOVAL_UNVERIFIED",
  primaryBlocker:"lb-sal-redistribution-and-machine-licence",
  sourceHosts:["github.com"],minSources:3
 }),
 "libvirtualhid-prerelease":Object.freeze({
  tag:"v2026.1022.2339.24",disposition:"PRERELEASE_LICENCE_BLOCKED",
  license:"LB_SAL_WINDOWS_MSI_NOT_MIT",
  redistribution:"PROHIBITED_WITHOUT_SEPARATE_PERMISSION",
  signing:"VENDOR_PRODUCTION_SIGNED_CLAIM_UNVERIFIED",
  offline:"LICENCE_DEPENDENT_ONLINE_CHECKS",
  rollback:"BROKER_DRIVER_REMOVAL_UNVERIFIED",
  primaryBlocker:"prerelease-and-lb-sal-license",
  sourceHosts:["github.com"],minSources:2
 }),
 "vigembus-retired":Object.freeze({
  tag:"v1.22.0",disposition:"RETIRED_NOT_CANDIDATE",
  license:"NOT_REVIEWED",redistribution:"NOT_CLEARED",
  signing:"HISTORICAL_NOT_VERIFIED",offline:"NOT_REVIEWED",
  rollback:"RETIRED_UNMAINTAINED",
  primaryBlocker:"retired-unmaintained-driver",
  sourceHosts:["github.com"],minSources:2
 })
});
const SCHEMA = Object.freeze([
 "id","tag","disposition","license","redistribution","signing",
 "offline","rollback","primaryBlocker","sources","mitigation"
]);
const TOP = Object.freeze(["schemaVersion","date","scope","consent","items"]);
function exactKeys(value,keys) {
 return !!value&&typeof value==="object"&&!Array.isArray(value)&&
  Object.keys(value).length===keys.length&&
  keys.every(key=>Object.hasOwn(value,key));
}
export function reviewP2DeploymentViability(matrix,pinnedReleases) {
 const releaseStatus=assessP2ReleaseEvidence(pinnedReleases);
 if(!exactKeys(matrix,TOP) || matrix.schemaVersion!==1 ||
    matrix.date!=="2026-10-25" ||
    matrix.scope!=="DOCUMENTARY_ONLY_NO_VENDOR_ARTIFACTS" ||
    matrix.consent!=="NO_PERMISSION_TO_ACQUIRE_EXECUTE_INSTALL_ELEVATE_TRUST_OR_BUY" ||
    !Array.isArray(matrix.items)||matrix.items.length!==4)
    throw new TypeError("invalid P2 documentary review");
 const seen=new Set(),decision=[];
 for(const item of matrix.items){
  if(!exactKeys(item,SCHEMA) || !Object.hasOwn(DECISIONS,item.id) ||
     seen.has(item.id)) throw new TypeError("unknown/duplicate P2 review row");
  seen.add(item.id);
  const spec=DECISIONS[item.id];
  if(Object.keys(spec).some(key=>!["sourceHosts","minSources"].includes(key)&&item[key]!==spec[key]) ||
     !Array.isArray(item.sources)||item.sources.length<spec.minSources ||
     new Set(item.sources).size!==item.sources.length ||
     item.sources.some(src=>{
       if(typeof src!=="string" || !src.startsWith("https://"))return true;
       try{return !spec.sourceHosts.includes(new URL(src).hostname);}catch{return true;}
     }) ||
     typeof item.mitigation!=="string" ||
     item.mitigation.length<65||item.mitigation.length>400)
      throw new TypeError("unsafe or unsupported documentary evidence");
  const release=releaseStatus.find(r=>r.id===item.id);
  if(!release || release.installAuthorized)
      throw new TypeError("pinned release identity mismatch");
  decision.push(Object.freeze({
   id:item.id,disposition:item.disposition,canRedistribute:false,
   canInstall:false,localSigningVerified:false,rollbackProven:false,
   remainingGates:Object.freeze(["third-party-or-license-permission",
     "offline-and-windows-compatibility-proof","signature-and-clean-rollback-proof",
     "separate-owner-permission"])
  }));
 }
 if(Object.keys(DECISIONS).some(id=>!seen.has(id)))
    throw new TypeError("missing vendor decision");
 return Object.freeze({decision:"NO_GO_FOR_DISTRIBUTION_OR_INSTALL",
   ownerConsent:false,physicalXInputVerified:false,
   candidates:Object.freeze(decision)});
}
