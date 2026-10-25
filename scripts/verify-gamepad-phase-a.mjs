/* P2 Phase A evidence/redistribution review oracle. Driver-free, offline. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {reviewP2DeploymentViability} from "./lib/p2-phase-a-policy.mjs";
const get=(name)=>JSON.parse(readFileSync(fileURLToPath(
 new URL("../docs/gamepad/"+name,import.meta.url)),"utf8"));
const matrix=get("P2-PHASE-A-DECISION.json"),releases=get("P2-RELEASE-EVIDENCE.json");
const clone=x=>JSON.parse(JSON.stringify(x));
let n=0;function ok(v,msg){n++;assert.ok(v,msg);}
const result=reviewP2DeploymentViability(matrix,releases);
ok(result.decision==="NO_GO_FOR_DISTRIBUTION_OR_INSTALL","no installation/release approval");
ok(!result.ownerConsent&&!result.physicalXInputVerified,"never implies owner consent or real XInput");
ok(result.candidates.length===4,"all pinned candidates assessed");
for(const x of result.candidates){
 ok(!x.canRedistribute&&!x.canInstall,"candidate cannot silently become distributable");
 ok(!x.localSigningVerified&&!x.rollbackProven,"signing/rollback not validated");
 ok(x.remainingGates.includes("separate-owner-permission"),"separate owner consent required");
}
const by=Object.fromEntries(result.candidates.map(x=>[x.id,x]));
ok(by["hidmaestro-stable"].disposition==="RESEARCH_ONLY_TRUST_BLOCKED",
 "MIT project is not permission for machine trust alteration");
ok(by["libvirtualhid-stable"].disposition==="LICENCE_REDISTRIBUTION_BLOCKED",
 "LB-SAL prevents unapproved MSI redistribution");
ok(by["libvirtualhid-prerelease"].disposition==="PRERELEASE_LICENCE_BLOCKED",
 "prerelease cannot bypass LB-SAL");
ok(by["vigembus-retired"].disposition==="RETIRED_NOT_CANDIDATE",
 "retired driver never promoted to production");
for(const edit of [
 m=>{m.ownerConsent=true;},m=>{m.scope="APPROVED";},
 m=>{m.items[0].disposition="INSTALL_APPROVED";},
 m=>{m.items[0].redistribution="CONFIRMED";},
 m=>{m.items[0].signing="MICROSOFT_SIGNED";},
 m=>{m.items[0].rollback="PROVEN";},
 m=>{m.items[0].sources=[];},
 m=>{m.items[1].license="MIT";},
 m=>{m.items[1].redistribution="PERMITTED";},
 m=>{m.items[1].sources=["https://example.com/license","https://example.com/license2","https://example.com/license3"];},
 m=>{m.items[2].disposition="RESEARCH_ONLY_TRUST_BLOCKED";},
 m=>{m.items[3].disposition="RECOMMENDED";},
 m=>{m.items[0].acquireBinary=true;},
 m=>{m.items.pop();},
 m=>{m.items.push({...m.items[0]});},
 m=>{m.items[0].mitigation="ok";},
 m=>{m.items[0].tag="v9.9.9";}
]){
 const v=clone(matrix);edit(v);
 assert.throws(()=>reviewP2DeploymentViability(v,releases),TypeError);n++;
}
for(const edit of [
 r=>{r.authorization="YES";},
 r=>{r.packages[0].localFileHashVerified=true;},
 r=>{r.packages[1].signatureIndependentlyVerified=true;}
]){const v=clone(releases);edit(v);
 assert.throws(()=>reviewP2DeploymentViability(matrix,v),TypeError);n++;}
const code=readFileSync(fileURLToPath(new URL("./lib/p2-phase-a-policy.mjs",import.meta.url)),"utf8");
for(const banned of ["node:child_process","node:fs","fetch(","spawn(","exec(","Process.Start","certutil","pnputil","Set-ExecutionPolicy","reg add"]){
 ok(!code.includes(banned),"pure evaluator has no IO/privilege: "+banned);
}
console.log(n+" assertions");
console.log("gamepad-phase-a verification passed (documentary and offline)");
