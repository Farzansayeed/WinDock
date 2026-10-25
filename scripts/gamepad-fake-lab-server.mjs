/**
 * PRIVATE, explicitly started Windows M0 fake-controller lab service ONLY.
 * Usage (after building the .NET sidecar):
 *   node scripts/gamepad-fake-lab-server.mjs 192.168.1.20
 * Not used by production. No driver, Xbox device, elevation or cloud.
 */
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../server.js";
import { createConfigStore } from "../src/config.js";
import { createFakeNativeSinkFactory } from "./lib/native-gamepad-fake-bridge.mjs";

const args=process.argv.slice(2),host=args[0];
function privateIPv4(value){
  if(typeof value!=="string"||!/^\d{1,3}(\.\d{1,3}){3}$/.test(value))return false;
  const a=value.split(".").map(Number);
  return a.every(n=>n>=0&&n<=255) &&
   (a[0]===10||(a[0]===172&&a[1]>=16&&a[1]<=31)||(a[0]===192&&a[1]===168));
}
if(process.platform!=="win32"||args.length!==1||!privateIPv4(host)){
  console.error("Windows only: node scripts/gamepad-fake-lab-server.mjs PRIVATE_LAN_IPv4");
  process.exit(64);
}
const dll=fileURLToPath(new URL("../native/gamepad-sidecar/bin/Release/net8.0/WinDock.GamepadSidecar.dll",import.meta.url));
if(!existsSync(dll)){
  console.error("First build: dotnet build native/gamepad-sidecar/WinDock.GamepadSidecar.csproj -c Release");
  process.exit(64);
}
const tmp=await mkdtemp(join(tmpdir(),"windock-gamepad-m0-lab-"));
let app;
try{
  app=await createApp({
    trustLoopback:false,
    configStore:createConfigStore({path:join(tmp,"config.json")}),
    provider:{id:"fake-lab",displayName:"Driver-free fake controller",input:null,capture:null,
      listInstalledApps:async()=>[],listRunningApps:async()=>[]},
    gamepadSinkFactory:createFakeNativeSinkFactory(),
  });
  await new Promise((resolve,reject)=>{
    app.server.once("error",reject);
    app.server.listen(8620,host,()=>{
      app.server.off("error",reject);resolve();
    });
  });
  console.log("Private Windows fake gamepad LAB: http://"+host+":8620");
  console.log("Pair normally with PIN shown in this local terminal: "+app.state.pin);
  console.log("FAKE C# sink only. No physical/virtual Xbox controller or driver.");
  console.log("Stop regular WinDock first if it uses 8620; Ctrl+C to exit.");
  let stopping=false;
  async function stop(){
    if(stopping)return;
    stopping=true;
    await app.gamepadHub.close();
    await app.hub.close();
    app.server.closeAllConnections?.();
    await new Promise(resolve=>app.server.close(resolve));
    await rm(tmp,{recursive:true,force:true});
    process.exit(0);
  }
  process.on("SIGINT",()=>{void stop();});
  process.on("SIGTERM",()=>{void stop();});
}catch{
  console.error("Could not start private fake lab; check private LAN IP/port.");
  if(app){
    await app.gamepadHub.close();
    await app.hub.close();
    app.server.closeAllConnections?.();
    await new Promise(resolve=>app.server.close(resolve));
  }
  await rm(tmp,{recursive:true,force:true});
  process.exitCode=1;
}
