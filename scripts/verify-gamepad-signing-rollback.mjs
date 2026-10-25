/* Pure, deterministic P2 signing and rollback approval guard. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assessP2SigningRollbackPlan } from "./lib/p2-signing-rollback-plan.mjs";
const read=(name)=>JSON.parse(readFileSync(fileURLToPath(
  new URL("../docs/gamepad/"+name,import.meta.url)),"utf8"));
const plan=read("P2-SIGNING-ROLLBACK-GATES.json"), inventory=read("P2-RELEASE-EVIDENCE.json");
const clone=x=>JSON.parse(JSON.stringify(x));
let n=0;
const ok=(x,msg)=>{n++;assert.ok(x,msg);};
const report=assessP2SigningRollbackPlan(plan,inventory);
ok(report.verdict==="STOP_REVIEW_ONLY","P2 plan cannot approve trial");
ok(report.uncleared===13,"all thirteen documentary/artifact/physical steps remain uncleared");
ok(!report.installAuthorized&&!report.ownerConsentRecorded,"consent never inferred from repo");
ok(!report.driverSigningVerified&&!report.rollbackVerified&&!report.physicalXInputVerified,
  "no vendor signing, rollback or gameplay proof was generated");
ok(report.stages.filter(s=>s.requiresSeparateApproval).length===8,
  "all artifact acquisition and Windows trial steps need separate consent");
for(const s of report.stages){
  ok(s.cleared===false,"step cannot be auto-completed: "+s.id);
  ok(s.requiresSeparateApproval===(s.stage!=="public-documents"),
    "protected stages cannot lose consent: "+s.id);
}
const mutations=[
 p=>{p.activationAuthorized=true;},
 p=>{p.ownerPermission="APPROVED";},
 p=>{p.installerCommand="setup.exe";},
 p=>{p.checks[0].status="PASS";},
 p=>{p.checks[0].status=true;},
 p=>{p.checks[5].requiresSeparateApproval=false;},
 p=>{p.checks[10].requiresSeparateApproval=false;},
 p=>{p.checks[8].stage="public-documents";},
 p=>{p.checks[2].id="publisher-and-redistribution";},
 p=>{p.checks.pop();},
 p=>{p.checks[3].approval=true;},
 p=>{p.checks[6].requiredEvidence="";},
 p=>{p.candidateReleases[0].status="APPROVED";},
 p=>{p.candidateReleases[2].status="RESEARCH_ONLY";},
 p=>{p.candidateReleases[3].status="RESEARCH_ONLY";},
 p=>{p.candidateReleases.push({...p.candidateReleases[0]});}
];
for(const mutate of mutations){
  const p=clone(plan);mutate(p);
  assert.throws(()=>assessP2SigningRollbackPlan(p,inventory),TypeError);n++;
}
for(const mutate of [
 p=>{p.packages[0].rollbackOnOwnerVerified=true;},
 p=>{p.packages[0].localFileHashVerified=true;},
 p=>{p.packages[0].sha256="bad";},
 p=>{p.packages[3].sha256="f".repeat(64);}
]){
  const inv=clone(inventory);mutate(inv);
  assert.throws(()=>assessP2SigningRollbackPlan(plan,inv),TypeError);n++;
}
const src=readFileSync(fileURLToPath(new URL("./lib/p2-signing-rollback-plan.mjs",import.meta.url)),"utf8");
for(const disallowed of ["node:child_process","node:fs","fetch(","spawn(","exec(","Process.Start","pnputil","certutil","Set-ExecutionPolicy","reg add","signtool.exe"]){
  ok(!src.includes(disallowed),"review evaluator performs no privileged/device/network action "+disallowed);
}
console.log(n+" assertions");
console.log("gamepad-signing-rollback verification passed (offline and approval-gated)");
