/** P2: static safety contract for the standalone read-only Windows XInput diagnostic. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createChecker } from "./lib/assert.mjs";

const t = createChecker("gamepad-probe");
const dir = join(import.meta.dirname, "../native/gamepad-probe");
const code = readFileSync(join(dir, "Program.cs"), "utf8");
const proj = readFileSync(join(dir, "WinDock.GamepadProbe.csproj"), "utf8");
const instructions = readFileSync(join(dir, "README.md"), "utf8");

t.ok(proj.includes("<TargetFramework>net8.0-windows</TargetFramework>"), "diagnostic stays compatible with current Windows .NET 8 runtime");
t.ok(proj.includes("<OutputType>Exe</OutputType>"), "diagnostic is standalone and not loaded into the WinDock host");
t.ok(!proj.includes("<PackageReference "), "diagnostic has no third-party driver dependencies");
t.ok(code.includes('DllImport("xinput1_4.dll"'), "only Windows system XInput DLL is used");
t.ok(code.includes("XInputGetState("), "diagnostic reads XInput state");
t.ok(code.includes("ErrorDeviceNotConnected"), "empty XInput slots are handled as normal");
t.ok(code.includes("private static string Format("), "axis/trigger/button values can be observed");
t.ok(code.includes("if (args.Length == 1 && args[0] == \"--help\")"), "help path is available without XInput hardware");
t.ok(code.includes("if (!OperatingSystem.IsWindows())"), "non-Windows execution fails gracefully");
for (const forbidden of ["XInputSetState", "InstallDriver(", "CreateController(", "Process.Start(", "runas", "DisableDriverSignature", "CertAddCertificateContext", "powershell.exe"]) {
  t.ok(!code.includes(forbidden), `read-only diagnostic excludes ${forbidden}`);
}
t.ok(instructions.includes("cannot tell whether") || instructions.includes("cannot tell whether"), "documentation discloses that physical and virtual are indistinguishable");
t.ok(instructions.includes("--watch 10") && instructions.includes("--scan"), "diagnostic examples cover both modes");
t.done("gamepad-probe verification passed");
