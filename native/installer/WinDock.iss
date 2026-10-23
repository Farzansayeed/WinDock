; Build with scripts/build-installer.ps1. Install only the runtime allowlist.
#ifndef AppVersion
  #define AppVersion "0.1.0"
#endif
#ifndef PackageDir
  #error PackageDir is required
#endif
#ifndef OutputDir
  #error OutputDir is required
#endif

[Setup]
#ifdef GamepadPreview
AppId={{DF04349C-257D-4DF7-9EAC-518AE55DC83A}
AppName=WinDock Gamepad Preview
#else
AppId={{A5613067-949D-4D26-B81D-8FD6328D8A7A}
AppName=WinDock
#endif
AppVersion={#AppVersion}
AppPublisher=WinDock
#ifdef GamepadPreview
AppPublisherURL=https://github.com/Farzansayeed/WinDock
AppSupportURL=https://github.com/Farzansayeed/WinDock/issues
DefaultDirName={localappdata}\Programs\WinDockGamepadPreview
DefaultGroupName=WinDock Gamepad Preview
#else
AppPublisherURL=https://github.com/aliihsaad/WinDock
AppSupportURL=https://github.com/aliihsaad/WinDock/issues
DefaultDirName={localappdata}\Programs\WinDock
DefaultGroupName=WinDock
#endif
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0.17763
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
WizardStyle=modern dark
SetupIconFile=..\tray\Assets\WinDock.ico
UninstallDisplayIcon={app}\WinDockTray.exe
UninstallDisplayName=WinDock
OutputDir={#OutputDir}
#ifdef GamepadPreview
OutputBaseFilename=WinDockGamepadPreviewSetup
#else
OutputBaseFilename=WinDockSetup
#endif
Compression=lzma2
SolidCompression=yes
SetupMutex=Local\WinDock.Setup
AppMutex=Local\WinDock.Tray
CloseApplications=yes
RestartApplications=no
VersionInfoVersion={#AppVersion}
VersionInfoDescription=WinDock Setup

[Tasks]
Name: desktopicon; Description: "Create a desktop shortcut"; Flags: unchecked
Name: autostart; Description: "Start WinDock when I sign in to Windows"; Flags: unchecked

[Files]
Source: "{#PackageDir}\WinDockTray.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PackageDir}\WinDockHelper.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PackageDir}\node.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PackageDir}\server.js"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PackageDir}\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PackageDir}\package-lock.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#PackageDir}\src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "config.json,*.log,*.pdb"
Source: "{#PackageDir}\public\*"; DestDir: "{app}\public"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "*.apk,config.json,*.log,*.pdb"
Source: "{#PackageDir}\node_modules\ws\*"; DestDir: "{app}\node_modules\ws"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
#ifdef GamepadPreview
Name: "{autoprograms}\WinDock Gamepad Preview"; Filename: "{app}\WinDockTray.exe"; WorkingDir: "{app}"
Name: "{autodesktop}\WinDock Gamepad Preview"; Filename: "{app}\WinDockTray.exe"; WorkingDir: "{app}"; Tasks: desktopicon
#else
Name: "{autoprograms}\WinDock"; Filename: "{app}\WinDockTray.exe"; WorkingDir: "{app}"
Name: "{autodesktop}\WinDock"; Filename: "{app}\WinDockTray.exe"; WorkingDir: "{app}"; Tasks: desktopicon
#endif

[Registry]
#ifdef GamepadPreview
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "WinDockGamepadPreview"; ValueData: """{app}\WinDockTray.exe"""; Flags: uninsdeletevalue; Tasks: autostart
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueName: "WinDockGamepadPreview"; Flags: deletevalue; Tasks: not autostart
#else
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "WinDock"; ValueData: """{app}\WinDockTray.exe"""; Flags: uninsdeletevalue; Tasks: autostart
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueName: "WinDock"; Flags: deletevalue; Tasks: not autostart
#endif

[Run]
Filename: "{app}\WinDockTray.exe"; Description: "Open WinDock"; WorkingDir: "{app}"; Flags: nowait postinstall skipifsilent

[Messages]
#ifdef GamepadPreview
FinishedHeadingLabel=WinDock Gamepad Preview is ready.
FinishedLabel=Experimental fork build. Quit regular WinDock before opening the preview because both use the same local port. Pair from the preview tray connection info.
#else
FinishedHeadingLabel=WinDock is ready.
FinishedLabel=Find WinDock in your Windows system tray. Choose Show connection info to pair your phone, then make the dock your own.
#endif
