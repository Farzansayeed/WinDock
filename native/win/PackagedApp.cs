using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

namespace WinDock;

internal static partial class PackagedApp
{
    [GeneratedRegex(@"\A[A-Za-z0-9][A-Za-z0-9.-]*_[A-Za-z0-9]+![A-Za-z0-9][A-Za-z0-9._-]*\z")]
    private static partial Regex Identifier();

    public static bool IsValid(string id) => id.Length <= 128 && Identifier().IsMatch(id);

    // The Windows app activation API reports actual HRESULT failures; unlike
    // ShellExecute("shell:AppsFolder"), an unsuccessful activation is visible.
    [ComImport, Guid("2e941141-7f97-4756-ba1d-9decde894a3d"),
        InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IApplicationActivationManager
    {
        [PreserveSig]
        int ActivateApplication(
            [MarshalAs(UnmanagedType.LPWStr)] string appUserModelId,
            [MarshalAs(UnmanagedType.LPWStr)] string? arguments,
            uint options, out uint processId);
    }

    [DllImport("ole32.dll", ExactSpelling = true)]
    private static extern int CoCreateInstance(
        ref Guid clsid, IntPtr outer, uint clsctx, ref Guid iid,
        [MarshalAs(UnmanagedType.Interface)] out IApplicationActivationManager manager);

    public static void Launch(string id)
    {
        if (!IsValid(id)) throw new ArgumentException("Invalid packaged app identifier.");
        // Use the LOCAL_SERVER class context for this short-lived launcher,
        // per Windows' IApplicationActivationManager documentation.
        var clsid = new Guid("45BA127D-10A8-46EA-8AB7-56EA9078943C");
        var iid = new Guid("2e941141-7f97-4756-ba1d-9decde894a3d");
        const uint clsctxLocalServer = 0x4;
        Marshal.ThrowExceptionForHR(CoCreateInstance(
            ref clsid, IntPtr.Zero, clsctxLocalServer, ref iid, out var activator));
        if (activator is null)
            throw new COMException("Windows application activation manager is unavailable.");
        try
        {
            var hr = activator.ActivateApplication(id, null, 0, out var processId);
            Marshal.ThrowExceptionForHR(hr);
            if (processId == 0)
                throw new COMException("Windows activated app without returning its process.");
        }
        finally { Marshal.ReleaseComObject(activator); }
        // Successful activation still does not guarantee a visible window.
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Size { public int Width, Height; }

    [ComImport, Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IShellItemImageFactory
    {
        [PreserveSig] int GetImage(Size size, uint flags, out IntPtr bitmap);
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, PreserveSig = true)]
    private static extern int SHCreateItemFromParsingName(string path, IntPtr bindContext,
        ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out IShellItemImageFactory factory);
    [DllImport("ole32.dll")] private static extern int CoInitializeEx(IntPtr reserved, uint mode);
    [DllImport("ole32.dll")] private static extern void CoUninitialize();
    [DllImport("gdi32.dll")] private static extern bool DeleteObject(IntPtr value);
    [DllImport("gdi32.dll", EntryPoint = "GetObjectW")]
    private static extern int GetObject(IntPtr value, int size, out DibSection bitmap);

    [StructLayout(LayoutKind.Sequential)]
    private struct NativeBitmap
    {
        public int Type, Width, Height, WidthBytes;
        public ushort Planes, BitsPixel;
        public IntPtr Bits;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct BitmapInfoHeader
    {
        public uint Size;
        public int Width, Height;
        public ushort Planes, BitCount;
        public uint Compression, SizeImage;
        public int XPelsPerMeter, YPelsPerMeter;
        public uint ClrUsed, ClrImportant;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct DibSection
    {
        public NativeBitmap Bitmap;
        public BitmapInfoHeader Header;
        public uint RedMask, GreenMask, BlueMask;
        public IntPtr Section;
        public uint Offset;
    }

    public static string? Icon(string id)
    {
        if (!IsValid(id)) throw new ArgumentException("Invalid packaged app identifier.");
        var initialized = CoInitializeEx(IntPtr.Zero, 0);
        IntPtr handle = IntPtr.Zero;
        IShellItemImageFactory? factory = null;
        try
        {
            var iid = typeof(IShellItemImageFactory).GUID;
            Marshal.ThrowExceptionForHR(SHCreateItemFromParsingName(@"shell:AppsFolder\" + id,
                IntPtr.Zero, ref iid, out factory));
            // SIIGBF_ICONONLY | SIIGBF_BIGGERSIZEOK | SIIGBF_SCALEUP.
            Marshal.ThrowExceptionForHR(factory.GetImage(new Size { Width = 256, Height = 256 }, 0x105, out handle));
            if (handle == IntPtr.Zero) return null;
            using var bitmap = CopyBitmap(handle);
            using var stream = new MemoryStream();
            bitmap.Save(stream, ImageFormat.Png);
            return Convert.ToBase64String(stream.ToArray());
        }
        catch { return null; }
        finally
        {
            if (handle != IntPtr.Zero) DeleteObject(handle);
            if (factory is not null) Marshal.ReleaseComObject(factory);
            if (initialized >= 0) CoUninitialize();
        }
    }

    private static Bitmap CopyBitmap(IntPtr handle)
    {
        // Preserve the alpha channel in the Shell's 32-bit DIB; FromHbitmap
        // alone discards it and leaves black backgrounds behind app artwork.
        if (GetObject(handle, Marshal.SizeOf<DibSection>(), out var data) != 0 &&
            data.Bitmap.BitsPixel == 32 && data.Bitmap.Bits != IntPtr.Zero)
        {
            var pixels = data.Bitmap;
            using var view = new Bitmap(pixels.Width, Math.Abs(pixels.Height), pixels.WidthBytes,
                PixelFormat.Format32bppPArgb, pixels.Bits);
            var copy = view.Clone(new Rectangle(0, 0, view.Width, view.Height), PixelFormat.Format32bppArgb);
            // Positive biHeight means the native DIB starts with its bottom row.
            if (data.Header.Height > 0) copy.RotateFlip(RotateFlipType.RotateNoneFlipY);
            return copy;
        }
        return Image.FromHbitmap(handle);
    }
}
