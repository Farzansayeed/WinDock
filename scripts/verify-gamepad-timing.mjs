/**
 * Real paired WebSocket -> Node gamepad hub -> fake in-memory sink.
 * Opt-in timing observer, bounded p50/p95/p99 and no private information.
 * NEVER creates an actual Xbox controller.
 */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket } from "ws";
import { createApp } from "../server.js";
import { createConfigStore } from "../src/config.js";
import { createGamepadTimingWindow } from "../src/gamepad/timing.js";
let checks=0;
function ok(c,msg){checks++;assert.ok(c,msg);}
function eq(a,b,msg){checks++;assert.deepEqual(a,b,msg);}
async function until(pred,msg,ms=2500){let end=Date.now()+ms;while(!pred()&&Date.now()<end)await new Promise(r=>setTimeout(r,10));ok(pred(),msg);}
const hist=createGamepadTimingWindow(8);
eq(hist.snapshot().p95Ms,null,"empty window not a performance claim");
for(let i=1;i<=12;i++)ok(hist.record({metric:"host-decode-validate-sink-call",ms:i}),"valid sample");
eq([hist.snapshot().samples,hist.snapshot().p50Ms,hist.snapshot().p95Ms,hist.snapshot().p99Ms,hist.snapshot().maxMs],[8,8,12,12,12],"ring overrun retains latest 8");
for(const v of [null,{}, {metric:"wifi",ms:1},
 {metric:"host-decode-validate-sink-call",ms:NaN},
 {metric:"host-decode-validate-sink-call",ms:Infinity},
 {metric:"host-decode-validate-sink-call",ms:-1},
 {metric:"host-decode-validate-sink-call",ms:10001},
 {metric:"host-decode-validate-sink-call",ms:1,client:"private"}])
 ok(!hist.record(v),"sensitive or invalid sample refused");
eq(hist.snapshot().totalRejected,8,"rejected count");
hist.reset();eq(hist.snapshot().samples,0,"reset erases measurements");
for(const invalid of [0,7,2049,1.5]){assert.throws(()=>createGamepadTimingWindow(invalid),RangeError);checks++;}
const tmp=await mkdtemp(join(tmpdir(),"windock-gamepad-m0-"));
const traces=[],reports=[];
let app;
try{
 app=await createApp({
  provider:{id:"fake",displayName:"Lab",input:null,capture:null,listInstalledApps:async()=>[],listRunningApps:async()=>[]},
  pin:"6457",trustLoopback:false,
  configStore:createConfigStore({path:join(tmp,"config.json")}),
  gamepadSinkFactory:()=>({write(s){reports.push({...s});},close(){}}),
  gamepadHubTiming:sample=>{traces.push(sample);hist.record(sample);},
  gamepadTimeoutMs:300,gamepadTickMs:20
 });
 await new Promise(resolve=>app.server.listen(0,"127.0.0.1",resolve));
 const origin="http://127.0.0.1:"+app.server.address().port;
 const auth=await fetch(origin+"/api/auth",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({pin:"6457"})});
 eq(auth.status,200,"actual pairing required");
 const cookie=auth.headers.get("set-cookie")?.split(";")[0];
 ok(!!cookie,"session cookie created");
 const ws=new WebSocket(origin.replace("http:","ws:")+"/gamepad",{headers:{origin,cookie}});
 const messages=[];ws.on("message",b=>messages.push(JSON.parse(String(b))));
 await new Promise((resolve,reject)=>{ws.once("open",resolve);ws.once("error",reject);});
 await until(()=>messages.some(x=>x.type==="ready"),"fake sink ready");
 ws.send(JSON.stringify({v:1,type:"state",seq:1,lx:180,ly:0,rx:0,ry:0,lt:0,rt:0,buttons:4096}));
 await until(()=>traces.length===1,"opt-in observer received one latency value");
 ok(reports.some(s=>s.buttons===4096),"input forwarded to fake sink");
 eq(traces[0].metric,"host-decode-validate-sink-call","metric provenance exact");
 ok(Number.isFinite(traces[0].ms)&&traces[0].ms>=0,"valid duration");
 ok(!("buttons" in traces[0])&&!JSON.stringify(traces).includes("6457"),"telemetry contains no input/PIN");
 ws.terminate();
 await until(()=>app.gamepadHub.ownerCount===0,"session closes");
}finally{
 if(app){await app.gamepadHub.close();await app.hub.close();app.server.closeAllConnections?.();await new Promise(resolve=>app.server.close(resolve));}
 await rm(tmp,{recursive:true,force:true});
}
console.log(checks+" assertions");
console.log("gamepad-timing verification passed (host software fake sink only)");
