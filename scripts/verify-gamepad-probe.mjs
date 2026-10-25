/** P2: static safety contract for the standalone read-only Windows XInput diagnostic. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createChecker } from "./lib/assert.mjs";

const t = createChecker("gamepad-probe");
const dir = join(import.meta.dirname, "../native/gamepad-probe");
const code = readFileSync(join(dir, "Program.cs"), "utf8");
const proj = readFileSync(join(dir, "WinDock.GamepadProbe.csproj"), "utf8");
const instructions = readFileSync(join(dir, "README.md"), "utf8");
const sdkFree = readFileSync(join(dir, "WinDock-XInputBaseline.ps1"), "utf8");

t.ok(proj.includes("<TargetFramework>net8.0-windows</TargetFramework>"), "diagnostic stays compatible with current Windows .NET 8 runtime");
t.ok(proj.includes("<OutputType>Exe</OutputType>"), "diagnostic is standalone and not loaded into the WinDock host");
t.ok(!proj.includes("<PackageReference "), "diagnostic has no third-party driver dependencies");
t.ok(code.includes('DllImport("xinput1_4.dll"'), "only Windows system XInput DLL is used");
t.ok(code.includes("XInputGetState("), "diagnostic reads XInput state");
t.ok(code.includes("ErrorDeviceNotConnected"), "empty XInput slots are handled as normal");
const audit = readFileSync(join(dir, "BackendAudit.cs"), "utf8");
t.ok(code.includes('args[0] == "--backend-audit"'), "standalone audit mode wired without changing baseline");
t.ok(audit.includes("OpenFlags.ReadOnly") && audit.includes("OpenFlags.OpenExistingOnly"), "audit reads only existing Windows certificate stores");
t.ok(audit.includes("RegistryView.Registry64") && audit.includes("writable: false"), "runtime registry inspection is strictly read-only");
t.ok(audit.includes("GetNameInfo") && !audit.includes("PrivateKey") && !audit.includes("Export("), "no secrets or certificate details accessed");
t.ok(audit.includes("certificate_trust_changed=no") && audit.includes("controller_created=no"), "audit explicitly records zero side effects");
for (const forbiddenAudit of ["InstallDriver(", "CreateController(", "Process.Start(", "SetValue(", "DeleteSubKey(", "XInputSetState", "OpenFlags.ReadWrite", "RegistryKey.Create", "DownloadFile(", "HttpClient("])
  t.ok(!audit.includes(forbiddenAudit), "read-only backend audit excludes " + forbiddenAudit);
t.ok(code.includes('args[0] == "--baseline"'), "read-only Windows P2 baseline mode exists");
t.ok(code.includes("RuntimeInformation.OSArchitecture"), "baseline reports architecture without personal device ID");
t.ok(code.includes("Environment.OSVersion.Version"), "baseline records Windows version for feasibility");
t.ok(instructions.includes("--baseline"), "safe owner baseline command documented");
t.ok(instructions.includes("SDK-free") && instructions.includes("WinDock-XInputBaseline.ps1"), "owner has SDK-free baseline instructions");
t.ok(instructions.includes("WinDockGamepadProbe-win-x64.exe") && instructions.includes("WinDockGamepadProbe-win-arm64.exe"), "document script-free x64 and ARM64 baselines");
t.ok(instructions.includes("PSSecurityException") && instructions.includes("do not bypass or disable"), "owner execution policy blocker has safe guidance");
const preview = readFileSync(join(dir, "../../.github/workflows/gamepad-preview.yml"), "utf8");
t.ok(preview.includes("--self-contained true") && preview.includes("-p:PublishSingleFile=true"), "portable probe includes bundled runtime");
t.ok(preview.includes("WinDockGamepadProbe-win-x64.exe") && preview.includes("WinDockGamepadProbe-win-arm64.exe"), "both architectures are packaged");
t.ok(preview.includes("$probe --baseline") && preview.includes("Missing XInput slot"), "x64 binary is executed in Windows CI");
t.ok(preview.includes("sha256sum WinDockGamepadPreviewSetup.exe WinDockGamepadPreview-Android.apk WinDockGamepadProbe-win-x64.exe"), "release hashes new assets");
t.ok(preview.includes("UNSIGNED") && preview.includes("SmartScreen"), "unsigned policy restrictions are disclosed");
t.ok(sdkFree.includes('DllImport("xinput1_4.dll"') && sdkFree.includes("XInputGetState"), "PowerShell probe reads only the Windows XInput system DLL");
t.ok(sdkFree.includes("connected_slots=") && sdkFree.includes("slot={0} disconnected"), "SDK-free probe enumerates and reports XInput slots");
t.ok(sdkFree.includes("os_architecture=") && sdkFree.includes("windows_version="), "SDK-free probe reports architecture and Windows build");
t.ok(sdkFree.includes("Add-Type") && !sdkFree.includes("dotnet run"), "SDK-free probe uses Windows PowerShell Add-Type without the .NET SDK");
for (const forbidden of ["XInputSetState", "Install-Module", "Install-Package", "Set-ExecutionPolicy", "Invoke-WebRequest", "Start-Process", "New-ItemProperty", "Set-ItemProperty", "Cert:\\"]) {
  t.ok(!sdkFree.includes(forbidden), `SDK-free probe excludes ${forbidden}`);
}
t.ok(code.includes("private static string Format("), "axis/trigger/button values can be observed");
t.ok(code.includes("var directLaunch = args.Length == 0") && code.includes("bool baseline = args.Length == 0"), "Explorer double-click defaults to full read-only baseline");
t.ok(code.includes("Press Enter to close this read-only report") && code.includes("Console.ReadLine()"), "Explorer view stays open until Enter");
t.ok(code.includes("!Console.IsInputRedirected && !Console.IsOutputRedirected"), "redirected/CI probe never pauses");
t.ok(instructions.includes("When double-clicking") && instructions.includes("v28") && instructions.includes("Press Enter"), "documentation explains prior short-lived console and new behavior");
t.ok(code.includes("if (args.Length == 1 && args[0] == \"--help\")"), "help path is available without XInput hardware");
t.ok(code.includes("if (!OperatingSystem.IsWindows())"), "non-Windows execution fails gracefully");
for (const forbidden of ["XInputSetState", "InstallDriver(", "CreateController(", "Process.Start(", "runas", "DisableDriverSignature", "CertAddCertificateContext", "powershell.exe"]) {
  t.ok(!code.includes(forbidden), `read-only diagnostic excludes ${forbidden}`);
}
t.ok(instructions.includes("cannot tell whether") || instructions.includes("cannot tell whether"), "documentation discloses that physical and virtual are indistinguishable");
t.ok(instructions.includes("--watch 10") && instructions.includes("--scan"), "diagnostic examples cover both modes");
t.done("gamepad-probe verification passed");
