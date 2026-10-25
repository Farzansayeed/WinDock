/** Offline P2 signing/rollback PLAN renderer; no drivers, binaries, or OS actions. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assessP2SigningRollbackPlan } from "./lib/p2-signing-rollback-plan.mjs";
if(process.argv.length!==2){
  console.error("Usage: node scripts/p2-signing-rollback-review.mjs (no arguments)");
  process.exit(2);
}
const get=(name)=>JSON.parse(readFileSync(fileURLToPath(
  new URL("../docs/gamepad/"+name,import.meta.url)),"utf8"));
const audit=assessP2SigningRollbackPlan(
  get("P2-SIGNING-ROLLBACK-GATES.json"),get("P2-RELEASE-EVIDENCE.json"));
console.log(audit.verdict+": "+audit.uncleared+" gates not cleared");
for(const s of audit.stages)
  console.log(s.stage+" | "+s.id+" | NOT_CLEARED | consent-gated="+s.requiresSeparateApproval);
console.log("No download, installer, machine trust, driver, licence, privilege or authorization.");
