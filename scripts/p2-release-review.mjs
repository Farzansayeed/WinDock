/* Offline printed inventory only; never installs/downloads a driver. */
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {assessP2ReleaseEvidence} from "./lib/p2-release-evidence.mjs";
if(process.argv.length!==2){console.error("Usage: node scripts/p2-release-review.mjs");process.exit(2);}
const c=JSON.parse(readFileSync(fileURLToPath(new URL("../docs/gamepad/P2-RELEASE-EVIDENCE.json",import.meta.url)),"utf8"));
for(const r of assessP2ReleaseEvidence(c))
  console.log(r.id+": "+r.decision+" ("+(r.hasPublishedDigest?"vendor metadata SHA-256 only":"NO published SHA-256")+")");
console.log("No binary downloaded, no local signature or rollback verified, no installation approved.");
