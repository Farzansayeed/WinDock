using System.Runtime.InteropServices;
using System.Security;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Win32;

namespace WinDock.GamepadProbe;

/// <summary>
/// Public, READ-ONLY capability indicators for a future separately approved P2
/// Windows trial. Does not install/load drivers, modify certificate stores, or
/// request elevation. NEVER prints certificate details or machine identifiers.
/// Missing indicators are not proof that a backend is absent or safe.
/// </summary>
internal static class BackendAudit
{
    internal static int Run()
    {
        if (!OperatingSystem.IsWindows())
        {
            Console.Error.WriteLine("P2 backend audit requires Windows; no changes made.");
            return 3;
        }

        Console.WriteLine("WinDock P2 BACKEND AUDIT: read-only; no installation, input, elevation or network.");
        Console.WriteLine("backend_audit_version=1");
        Console.WriteLine($"windows_version={Environment.OSVersion.Version}");
        Console.WriteLine($"os_architecture={RuntimeInformation.OSArchitecture}");
        Console.WriteLine($"process_architecture={RuntimeInformation.ProcessArchitecture}");
        Console.WriteLine($"dotnet10_x64_runtime_registry={ReadDotnet10RuntimeRegistry()}");
        Console.WriteLine($"hidmaestro_test_cert_machine_root={CertPresence(StoreName.Root)}");
        Console.WriteLine($"hidmaestro_test_cert_machine_trustedpublisher={CertPresence(StoreName.TrustedPublisher)}");
        Console.WriteLine($"hidmaestro_test_cert_machine_my={CertPresence(StoreName.My)}");
        Console.WriteLine("device_or_driver_installation_performed=no");
        Console.WriteLine("certificate_trust_changed=no");
        Console.WriteLine("controller_created=no");
        Console.WriteLine("meaning=indicators_only_not_backend_approval_or_xinput_proof");
        return 0;
    }

    private static string ReadDotnet10RuntimeRegistry()
    {
        // Windows SDK-free packaged probe can read the x64 .NET runtime
        // registration. A self-contained .NET 10 build may not appear here.
        try
        {
            using var machine = RegistryKey.OpenBaseKey(RegistryHive.LocalMachine, RegistryView.Registry64);
            using var runtimes = machine.OpenSubKey(
                @"SOFTWARE\dotnet\Setup\InstalledVersions\x64\sharedfx\Microsoft.NETCore.App",
                writable: false);
            if (runtimes is null) return "not_detected";
            foreach (var version in runtimes.GetValueNames())
                if (version.StartsWith("10.", StringComparison.Ordinal))
                    return "detected";
            return "not_detected";
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or SecurityException)
        {
            return "unavailable";
        }
    }

    private static string CertPresence(StoreName name)
    {
        // Only look for the public certificate's CN. Do not read private keys,
        // output fingerprints/subjects, or trust a matching CN as authenticity.
        // OpenExistingOnly avoids even creating an absent certificate store.
        try
        {
            using var store = new X509Store(name, StoreLocation.LocalMachine);
            store.Open(OpenFlags.ReadOnly | OpenFlags.OpenExistingOnly);
            foreach (var cert in store.Certificates)
            {
                if (string.Equals(cert.GetNameInfo(X509NameType.SimpleName, false),
                    "HIDMaestroTestCert", StringComparison.OrdinalIgnoreCase))
                    return "present";
            }
            return "not_detected";
        }
        catch (Exception ex) when (ex is CryptographicException or
                                   UnauthorizedAccessException or SecurityException)
        {
            return "unavailable";
        }
    }
}
