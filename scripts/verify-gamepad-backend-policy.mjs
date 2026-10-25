/** Deterministic fail-closed P2 backend-screen oracle; no driver/Windows IO. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assessP2Catalog, assessP2Candidate } from "./lib/p2-backend-policy.mjs";
let assertions=0;
const check=(condition,why)=>{assertions++;assert.ok(condition,why);};
const path=fileURLToPath(new URL("../docs/gamepad/P2-BACKEND-CANDIDATES.json",import.meta.url));
const catalog=JSON.parse(readFileSync(path,"utf8"));
const results=assessP2Catalog(catalog);
check(results.length===3,"all distinct vendors reviewed");
for(const r of results){
  check(r.decision==="BLOCKED_REVIEW_ONLY","no candidate can become approved");
  check(r.installAuthorized===false&&r.activatesGamepad===false,"no install or gamepad authorization");
  check(r.blockers.includes("separate-informed-owner-consent-required"),
    "owner consent cannot be expressed by repository evidence");
  check(Object.isFrozen(r.blockers),"result cannot be amended to remove blockers");
}
const byId=Object.fromEntries(results.map(r=>[r.id,r]));
check(byId.hidmaestro.blockers.includes("requires-machine-trust-change-approval"),
  "self-signed HIDMaestro machine root is a hard blocker");
check(byId.hidmaestro.blockers.includes("requires-administrator-approval"),
  "HIDMaestro UAC prerequisite is a hard blocker");
check(byId.hidmaestro.blockers.includes("clean-rollback-unverified"),
  "documented uninstaller is not physical rollback proof");
check(byId.libvirtualhid.blockers.includes("entitlement-unresolved"),
  "paid Windows entitlement does not silently pass");
check(byId.libvirtualhid.blockers.includes("unconditional-offline-behavior-unverified"),
  "conditional online checks fail strict local-only requirement");
check(byId.libvirtualhid.blockers.includes("owner-windows-compatibility-unverified"),
  "Windows 10 best effort is not physical Windows proof");
check(byId.vigembus.blockers.includes("driver-not-maintained"),
  "archived ViGEmBus never automatically qualifies");
const clone=x=>JSON.parse(JSON.stringify(x));
for(const mutation of [
  c=>{c.candidates.push(clone(c.candidates[0]));},
  c=>{c.candidates[1].id="hidmaestro";},
  c=>{c.approved=true;},
  c=>{c.consent="approved";},
  c=>{c.schemaVersion=2;},
  c=>{c.candidates[0].ownerApproval=true;},
  c=>{c.candidates[0].requiresElevation="false";},
  c=>{c.candidates[0].source="http://not-secure.test";},
  c=>{c.candidates[0].driverSigning="test-mode";},
]){
  const invalid=clone(catalog);
  mutation(invalid);
  assert.throws(()=>assessP2Catalog(invalid),TypeError);
  assertions++;
}
// Even a fictitious "perfect" candidate remains blocked until a separate,
// explicit, informed owner action outside this repository permits a trial.
const perfect={...clone(catalog.candidates[0]),
  driverSigning:"production-signed",requiresElevation:false,
  changesMachineCertificateTrust:false,offline:"unconditional-verified",
  redistribution:"confirmed",rollback:"verified",windows10:"verified",
  maintained:true,xinput:"vendor-claimed",entitlement:"no-licence-claim"};
const noAutoConsent=assessP2Candidate(perfect);
check(noAutoConsent.blockers.length===1&&
  noAutoConsent.blockers[0]==="separate-informed-owner-consent-required",
  "even ideal manifest cannot approve privileged or nonprivileged install");
check(!noAutoConsent.installAuthorized, "no manifest can ever grant permission");
const text=readFileSync(fileURLToPath(new URL("./lib/p2-backend-policy.mjs",import.meta.url)),"utf8");
for(const forbidden of ["child_process","http:","https:","Process.Start","spawn(","exec(","XInputSetState","InstallDriver","Start-Process","Set-ExecutionPolicy","certutil","pnputil"]){
  check(!text.includes(forbidden),"pure P2 policy excludes side effects: "+forbidden);
}
console.log(assertions+" assertions");
console.log("gamepad-backend-policy verification passed (no driver; pure evaluation)");
