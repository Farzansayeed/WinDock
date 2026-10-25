/* P2 offline release metadata evidence validator: NO installer, network, device or privilege IO. */
const IDS = Object.freeze(["hidmaestro-stable","libvirtualhid-stable","libvirtualhid-prerelease","vigembus-retired"]);
const FIELDS = ["id","vendor","repo","tag","channel","published","asset","sha256","hazards","releaseUrl","digestSource","signatureIndependentlyVerified","rollbackOnOwnerVerified","localFileHashVerified"];
const LABELS = Object.freeze({
 "hidmaestro-stable":["hidmaestro","hifihedgehog/HIDMaestro","stable"],
 "libvirtualhid-stable":["libvirtualhid","LizardByte/libvirtualhid","stable"],
 "libvirtualhid-prerelease":["libvirtualhid","LizardByte/libvirtualhid","prerelease"],
 "vigembus-retired":["vigembus","nefarius/ViGEmBus","retired"]
});
export function assessP2ReleaseEvidence(c){
  if(!c || typeof c!=="object" || Array.isArray(c) ||
     Object.keys(c).length!==5 || !["schemaVersion","reviewedOn","authorization","evidenceScope","packages"].every(k=>Object.hasOwn(c,k)) ||
     c.schemaVersion!==1 || c.reviewedOn!=="2026-10-25" ||
     c.authorization!=="NONE; CATALOG CANNOT AUTHORIZE INSTALLATION" ||
     c.evidenceScope!=="GITHUB_RELEASE_METADATA_ONLY; NO BINARY DOWNLOADED_OR_VERIFIED" ||
     !Array.isArray(c.packages) || c.packages.length!==4)
     throw new TypeError("invalid P2 release catalog");
  const seen=new Set(), out=[];
  for(const p of c.packages){
    if(!p || typeof p!=="object" || Array.isArray(p) ||
       Object.keys(p).length!==FIELDS.length ||
       !FIELDS.every(k=>Object.hasOwn(p,k)) || !IDS.includes(p.id) ||
       seen.has(p.id)) throw new TypeError("invalid or duplicate release evidence");
    seen.add(p.id);
    const identity=LABELS[p.id];
    if(p.vendor!==identity[0] || p.repo!==identity[1] || p.channel!==identity[2] ||
       typeof p.tag!=="string" || !/^v[0-9.]+$/.test(p.tag) ||
       typeof p.published!=="string" || !/^20\d\d-\d\d-\d\d$/.test(p.published) ||
       p.published>c.reviewedOn ||
       p.releaseUrl!=="https://github.com/"+p.repo+"/releases/tag/"+p.tag ||
       typeof p.asset!=="string" || !/^[a-zA-Z0-9._-]{5,120}$/.test(p.asset) ||
       !(p.sha256===null || typeof p.sha256==="string" && /^[a-f0-9]{64}$/.test(p.sha256)) ||
       (p.sha256===null ? p.digestSource!=="not-provided" : p.digestSource!=="github-release-api") ||
       p.signatureIndependentlyVerified!==false || p.rollbackOnOwnerVerified!==false ||
       p.localFileHashVerified!==false ||
       !Array.isArray(p.hazards) || p.hazards.length<2 ||
       p.hazards.some(h=>typeof h!=="string" || !/^[a-z0-9-]+$/.test(h)))
       throw new TypeError("invalid or overclaimed release evidence");
    out.push(Object.freeze({id:p.id,decision:"EVIDENCE_ONLY_NOT_INSTALL_APPROVED",
      hasPublishedDigest:p.sha256!==null,installAuthorized:false,
      signatureVerified:false,rollbackVerified:false}));
  }
  if(IDS.some(id=>!seen.has(id)))throw new TypeError("missing vendor release");
  return Object.freeze(out);
}
