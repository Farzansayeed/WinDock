/**
 * Driver-free authenticated WebSocket cleanup failure containment.
 * Simulates sink.close() success/rejection/throw without any controller.
 * An uncertain native device release must NEVER permit a second owner.
 */
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket } from "ws";
import { createApp } from "../server.js";
import { createConfigStore } from "../src/config.js";

let assertions=0;
function ok(value,why){assertions++;assert.ok(value,why);}
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(pred,why,ms=2000){
  const deadline=Date.now()+ms;
  while(!pred()&&Date.now()<deadline)await sleep(10);
  ok(pred(),why);
}
function connect(url,origin,cookie){
 return new Promise(resolve=>{
  const ws=new WebSocket(url,{headers:{origin,cookie}});
  let done=false;
  const finish=out=>{if(!done){done=true;resolve({...out,ws});}};
  ws.once("open",()=>finish({opened:true}));
  ws.once("unexpected-response",(_,response)=>{
    const code=response.statusCode;response.resume();finish({opened:false,status:code});
  });
  ws.once("error",()=>finish({opened:false,status:null}));
 });
}
const provider={id:"fake",displayName:"Test",input:null,capture:null,
  listInstalledApps:async()=>[],listRunningApps:async()=>[]};
const frame=JSON.stringify({v:1,type:"state",seq:1,lx:99,ly:0,rx:0,ry:0,lt:0,rt:0,buttons:0x1000});
async function scenario(name,makeSink,expectQuarantine) {
 const tmp=await mkdtemp(join(tmpdir(),"windock-gamepad-quarantine-"));
 const writes=[],calls=[];
 let app;
 try {
  app=await createApp({
    provider,pin:"3579",trustLoopback:false,
    configStore:createConfigStore({path:join(tmp,"config.json")}),
    gamepadSinkFactory:()=>makeSink(writes,calls),
    gamepadTimeoutMs:300,gamepadTickMs:20
  });
  await new Promise(resolve=>app.server.listen(0,"127.0.0.1",resolve));
  const origin="http://127.0.0.1:"+app.server.address().port;
  const url=origin.replace("http:","ws:")+"/gamepad";
  const auth=await fetch(origin+"/api/auth",{
    method:"POST",headers:{origin,"content-type":"application/json"},
    body:JSON.stringify({pin:"3579"})
  });
  ok(auth.status===200,name+": paired cookie issued");
  const cookie=auth.headers.get("set-cookie")?.split(";")[0];
  ok(Boolean(cookie),name+": paired cookie present");
  const first=await connect(url,origin,cookie);
  ok(first.opened,name+": original owner established");
  // Missing close methods intentionally fail at sink validation; such a
  // partial sink cannot be considered ready or release-confirmed.
  if(name!=="no-close-method"){
    first.ws.send(frame);
    await until(()=>writes.some(s=>s.buttons===0x1000),name+": A reaches fake sink");
    first.ws.terminate();
  }
  await until(()=>calls.length>0 || name==="no-close-method" &&
    first.ws.readyState===WebSocket.CLOSED,name+": native cleanup attempted");
  await until(()=>app.gamepadHub.ownerCount===0,name+": original owner cleared");
  ok(app.gamepadHub.quarantined===expectQuarantine,
    name+": quarantine matches actual teardown outcome");
  const retry=await connect(url,origin,cookie);
  if(expectQuarantine){
    ok(!retry.opened&&retry.status===503,name+": quarantine denies next owner with 503");
    ok(app.gamepadHub.ownerCount===0,name+": no second owner admitted");
  }else{
    ok(retry.opened,name+": confirmed successful release permits new owner");
    retry.ws.terminate();
    await until(()=>app.gamepadHub.ownerCount===0,
      name+": healthy replacement closes normally");
  }
 }finally{
  if(app){
    await app.gamepadHub.close();
    await app.hub.close();
    app.server.closeAllConnections?.();
    await new Promise(resolve=>app.server.close(resolve));
  }
  await rm(tmp,{recursive:true,force:true});
 }
}
await scenario("async-close-reject",(writes,calls)=>({
  write(s){writes.push({...s});},
  close(){calls.push("close");return Promise.reject(new Error("native sink still attached"));}
}),true);
await scenario("sync-close-throw",(writes,calls)=>({
  write(s){writes.push({...s});},
  close(){calls.push("close");throw new Error("cannot dispose virtual device");}
}),true);
await scenario("no-close-method",(writes,calls)=>({
  write(s){writes.push({...s});}
}),true);
await scenario("successful-release",(writes,calls)=>({
  write(s){writes.push({...s});},
  close(){calls.push("close");return Promise.resolve();}
}),false);
console.log(assertions+" assertions");
console.log("gamepad-cleanup-containment verification passed (fake sink only)");
