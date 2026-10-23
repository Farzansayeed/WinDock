using System.Diagnostics;
using System.ComponentModel;

namespace WinDock;

/// <summary>
/// Finds an already-open top-level window for a specific executable, without
/// mistaking Chromium/CEF background child processes for the visible app.
/// Never matches on display title or filename alone: the full on-disk path
/// must equal the selected shortcut target (case-insensitively on Windows).
/// </summary>
internal static class ExecutableWindows
{
    internal static nint FindVisibleMainWindow(string executable)
    {
        if (!Path.IsPathFullyQualified(executable) ||
            !executable.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
            return nint.Zero;

        string path;
        try { path = Path.GetFullPath(executable); }
        catch (Exception ex) when (ex is ArgumentException or NotSupportedException or PathTooLongException)
        {
            return nint.Zero;
        }

        var name = Path.GetFileNameWithoutExtension(path);
        // GetProcessesByName is a cheap narrowing step, not proof of identity.
        // Multi-process CEF/Electron applications have several such processes.
        foreach (var candidate in Process.GetProcessesByName(name))
        {
            using (candidate)
            {
                try
                {
                    var hwnd = candidate.MainWindowHandle;
                    if (hwnd == nint.Zero) continue;

                    // MainModule may be inaccessible for a higher-privilege or
                    // protected process. Skip, don't elevate or guess.
                    var actual = candidate.MainModule?.FileName;
                    if (actual is null) continue;
                    if (string.Equals(Path.GetFullPath(actual), path,
                        StringComparison.OrdinalIgnoreCase))
                        return hwnd;
                }
                catch (Exception ex) when (
                    ex is Win32Exception or InvalidOperationException or
                    ArgumentException or NotSupportedException or PathTooLongException)
                {
                    // Process exited / access denied / path unavailable.
                }
            }
        }
        return nint.Zero;
    }
}
