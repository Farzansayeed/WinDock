/* Pure deterministic P2 exact vendor release/rollback gate; no binaries used. */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {assessP2ReleaseEvidence} from "./lib/p2-release-evidence.mjs";
let n=0;const ok=(value,message)=>{n++;assert.ok(value,message);};
const path=fileURLToPath(new URL("../docs/gamepad/P2-RELEASE-EVIDENCE.json",import.meta.url));
const c=JSON.parse(readFileSync(path,"utf8"));
const results=assessP2ReleaseEvidence(c);
ok(results.length===4,"all exact release identities checked");
for(const r of results){
  ok(r.decision==="EVIDENCE_ONLY_NOT_INSTALL_APPROVED","never approves install");
  ok(!r.installAuthorized && !r.signatureVerified && !r.rollbackVerified,
    "published digest is not signing or rollback proof");
}
const rows=Object.fromEntries(c.packages.map(x=>[x.id,x]));
ok(rows["hidmaestro-stable"].sha256==="b1578a391971f4296026b692844292dfc55ddbddbeabc2bcada8cc36c6e34cd2","HIDMaestro exact stable digest");
ok(rows["libvirtualhid-stable"].sha256==="bc31539a41f71939c13decb171ccbd4306fae1fed63273434a4f5ceccaf3e71c","libvirtualhid latest stable digest");
ok(rows["libvirtualhid-prerelease"].sha256==="b667470b32e3f6e0d66893235693de008ab80863291053dbf89a7532d321ef18","separate prerelease digest");
ok(rows["vigembus-retired"].sha256===null,"retired ViGEmBus API SHA missing");
ok(rows["hidmaestro-stable"].hazards.includes("include-usbip-can-restart-usb3-root-hubs"),"USB 3 root hub rollback risk retained");
ok(rows["libvirtualhid-stable"].hazards.includes("conditional-offline-broker-limit"),"offline broker limitation retained");
const edits=[
 x=>{x.approved=true;},x=>{x.authorization="approved";},
 x=>{x.packages.pop();},x=>{x.packages[0].localFileHashVerified=true;},
 x=>{x.packages[0].signatureIndependentlyVerified=true;},
 x=>{x.packages[0].rollbackOnOwnerVerified=true;},
 x=>{x.packages[0].hazards=[];},x=>{x.packages[0].sha256="deadbeef";},
 x=>{x.packages[0].releaseUrl="http://evil.test";},
 x=>{x.packages[2].channel="stable";},
 x=>{x.packages[3].sha256="0".repeat(64);},
 x=>{x.packages[0].driverInstaller="exe";},
 x=>{x.packages[1].id="hidmaestro-stable";}
];
for(const edit of edits){const clone=JSON.parse(JSON.stringify(c));edit(clone);
  assert.throws(()=>assessP2ReleaseEvidence(clone),TypeError);n++;}
const policy=readFileSync(fileURLToPath(new URL("./lib/p2-release-evidence.mjs",import.meta.url)),"utf8");
for(const forbidden of ["node:child_process","node:fs","fetch(","spawn(","exec(","Process.Start","pnputil","certutil","Set-ExecutionPolicy"]){
  ok(!policy.includes(forbidden),"release validator pure: "+forbidden);
}
console.log(n+" assertions");
console.log("gamepad-release-evidence verification passed (offline, no driver)");
