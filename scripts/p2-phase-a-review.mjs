/* Only reads local JSON and prints review decisions, never device/driver IO. */
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {reviewP2DeploymentViability} from "./lib/p2-phase-a-policy.mjs";
if(process.argv.length!==2){console.error("Usage: node scripts/p2-phase-a-review.mjs");process.exit(2);}
const read=name=>JSON.parse(readFileSync(fileURLToPath(
 new URL("../docs/gamepad/"+name,import.meta.url)),"utf8"));
const result=reviewP2DeploymentViability(
 read("P2-PHASE-A-DECISION.json"),read("P2-RELEASE-EVIDENCE.json"));
console.log("P2 documentary review: "+result.decision);
for(const c of result.candidates)
 console.log(c.id+" : "+c.disposition+" — no redistribution/install approval");
console.log("No vendor artifacts, licences, admin, driver, trust or physical tests.");
