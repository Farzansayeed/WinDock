/**
 * Read-only local P2 blocker report.
 * Never downloads packages, runs installers, touches drivers or grants consent.
 *
 * node scripts/p2-backend-review.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assessP2Catalog } from "./lib/p2-backend-policy.mjs";

if (process.argv.length !== 2) {
  console.error("Usage: node scripts/p2-backend-review.mjs (no arguments)");
  process.exit(2);
}
const catalog=JSON.parse(readFileSync(fileURLToPath(
  new URL("../docs/gamepad/P2-BACKEND-CANDIDATES.json", import.meta.url)), "utf8"));
const result=assessP2Catalog(catalog);
console.log("P2 backend evidence review — NO installation or permissions requested");
for (const row of result)
  console.log(row.id + ": " + row.decision + " — " + row.blockers.join(", "));
console.log("No P2 backend approved. Actual Windows XInput and PC gameplay UNVERIFIED.");
