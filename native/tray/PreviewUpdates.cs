using System.Net.Http;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace WinDock.Tray;

/// <summary>Strict, fork-only release metadata; rejects drafts, unexpected URLs and unsigned hashes.</summary>
internal sealed record PreviewRelease(string Version, string Tag, Uri Download, string Sha256, long Size)
{
    internal Uri Page => new($"https://github.com/Farzansayeed/WinDock/releases/tag/{Tag}");
}

internal static class PreviewReleaseCatalog
{
    internal const string Api = "https://api.github.com/repos/Farzansayeed/WinDock/releases?per_page=30";
    internal const string Installer = "WinDockGamepadPreviewSetup.exe";
    private static readonly Regex TagPattern = new(
        @"^gamepad-v(?<version>(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)-gamepad\.(?:0|[1-9]\d*))-g[0-9a-f]{7}$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    internal static PreviewRelease? Newest(string json, string installed)
    {
        if (json.Length > 2_000_000) throw new InvalidDataException("Release metadata too large.");
        var installedVersion = ReleaseVersion.Parse(installed);
        using var document = JsonDocument.Parse(json);
        if (document.RootElement.ValueKind != JsonValueKind.Array)
            throw new InvalidDataException("Invalid release listing.");
        PreviewRelease? newest = null;
        foreach (var release in document.RootElement.EnumerateArray())
        {
            if (release.ValueKind != JsonValueKind.Object ||
                !release.TryGetProperty("draft", out var draft) || draft.ValueKind != JsonValueKind.False ||
                !release.TryGetProperty("prerelease", out var preview) || preview.ValueKind != JsonValueKind.True ||
                !release.TryGetProperty("tag_name", out var tagElement) ||
                tagElement.ValueKind != JsonValueKind.String ||
                !release.TryGetProperty("assets", out var assets) || assets.ValueKind != JsonValueKind.Array)
                continue;
            var tag = tagElement.GetString()!;
            var match = TagPattern.Match(tag);
            if (!match.Success) continue;
            var version = match.Groups["version"].Value;
            var parsed = ReleaseVersion.Parse(version);
            if (parsed.CompareTo(installedVersion) <= 0 ||
                (newest is not null && parsed.CompareTo(ReleaseVersion.Parse(newest.Version)) <= 0))
                continue;
            foreach (var asset in assets.EnumerateArray())
            {
                if (asset.ValueKind != JsonValueKind.Object ||
                    !asset.TryGetProperty("name", out var name) || name.GetString() != Installer ||
                    !asset.TryGetProperty("browser_download_url", out var url) ||
                    url.ValueKind != JsonValueKind.String ||
                    !asset.TryGetProperty("digest", out var digest) || digest.ValueKind != JsonValueKind.String ||
                    !asset.TryGetProperty("size", out var size) || !size.TryGetInt64(out var bytes) ||
                    bytes < 1_000_000 || bytes > 300_000_000) continue;
                var expected = $"https://github.com/Farzansayeed/WinDock/releases/download/{tag}/{Installer}";
                if (url.GetString() != expected) continue;
                var hash = digest.GetString()!;
                if (!Regex.IsMatch(hash, @"^sha256:[0-9a-fA-F]{64}$", RegexOptions.CultureInvariant)) continue;
                newest = new PreviewRelease(version, tag, new Uri(expected), hash[7..].ToLowerInvariant(), bytes);
                break;
            }
        }
        return newest;
    }
}

internal static class PreviewUpdateDownload
{
    internal static async Task<string> DownloadVerifiedAsync(HttpClient http, PreviewRelease release,
        CancellationToken token = default)
    {
        var folder = Path.Combine(Path.GetTempPath(), "WinDockGamepadPreviewUpdates", release.Tag);
        Directory.CreateDirectory(folder);
        var filename = Path.Combine(folder, PreviewReleaseCatalog.Installer);
        if (File.Exists(filename))
        {
            if (await VerifyAsync(filename, release, token)) return filename;
            File.Delete(filename);
        }
        var temporary = filename + ".download";
        try
        {
            using var response = await http.GetAsync(release.Download, HttpCompletionOption.ResponseHeadersRead, token);
            response.EnsureSuccessStatusCode();
            if (response.Content.Headers.ContentLength is long size && size > release.Size)
                throw new InvalidDataException("Oversized installer.");
            await using (var input = await response.Content.ReadAsStreamAsync(token))
            await using (var output = new FileStream(temporary, FileMode.Create, FileAccess.Write, FileShare.None,
                65536, FileOptions.Asynchronous))
            {
                var buffer = new byte[65536];
                long written = 0;
                int count;
                while ((count = await input.ReadAsync(buffer.AsMemory(), token)) > 0)
                {
                    written += count;
                    if (written > release.Size) throw new InvalidDataException("Installer exceeds published size.");
                    await output.WriteAsync(buffer.AsMemory(0, count), token);
                }
                if (written != release.Size) throw new InvalidDataException("Installer size mismatch.");
            }
            if (!await VerifyAsync(temporary, release, token))
                throw new InvalidDataException("Installer SHA-256 mismatch; update rejected.");
            File.Move(temporary, filename, true);
            return filename;
        }
        catch
        {
            try { File.Delete(temporary); } catch (IOException) { }
            throw;
        }
    }

    private static async Task<bool> VerifyAsync(string path, PreviewRelease release, CancellationToken token)
    {
        if (new FileInfo(path).Length != release.Size) return false;
        await using var stream = File.OpenRead(path);
        var digest = await SHA256.HashDataAsync(stream, token);
        return CryptographicOperations.FixedTimeEquals(digest, Convert.FromHexString(release.Sha256));
    }
}
