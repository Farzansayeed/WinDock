param([string]$Dotnet = '', [switch]$GamepadPreview, [string]$PreviewVersion = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $projectRoot 'artifacts\WinDock-win-x64'
if (-not $Dotnet) {
    $localSdk = Join-Path $projectRoot '.tools\dotnet\dotnet.exe'
    $Dotnet = if (Test-Path -LiteralPath $localSdk) { $localSdk } else { (Get-Command dotnet -ErrorAction Stop).Source }
}
$env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = '1'
$env:DOTNET_CLI_HOME = Join-Path $projectRoot '.tools\dotnet-home'
$env:NUGET_PACKAGES = Join-Path $projectRoot '.tools\nuget'

Push-Location $projectRoot
try {
    if ($GamepadPreview -and $PreviewVersion -notmatch '^\d+\.\d+\.\d+-gamepad\.\d+$') {
        throw 'Invalid Gamepad preview version.'
    }
    foreach ($project in @('native\win\WinDockHelper.csproj', 'native\tray\WinDockTray.csproj')) {
        $publishArgs = @('publish', $project, '-c', 'Release', '-r', 'win-x64',
            '--self-contained', 'true', '-p:IncludeNativeLibrariesForSelfExtract=true',
            '-o', $outputPath, '--nologo')
        if ($GamepadPreview -and $project -like '*WinDockTray.csproj') {
            $publishArgs += '-p:DefineConstants=GAMEPAD_PREVIEW'
            $publishArgs += "-p:InformationalVersion=$PreviewVersion"
        }
        & $Dotnet @publishArgs
        if ($LASTEXITCODE -ne 0) { throw "Publish failed: $project" }
    }
    Copy-Item -LiteralPath 'server.js','package.json','package-lock.json' -Destination $outputPath -Force
    foreach ($directory in @('src','public')) {
        $destination = Join-Path $outputPath $directory
        New-Item -ItemType Directory -Path $destination -Force | Out-Null
        Get-ChildItem -LiteralPath $directory | Copy-Item -Destination $destination -Recurse -Force
    }
    & npm.cmd ci --omit=dev --ignore-scripts --no-audit --no-fund --prefix $outputPath
    if ($LASTEXITCODE -ne 0) { throw 'Packaged dependency installation failed' }
    Copy-Item -LiteralPath (Get-Command node.exe -ErrorAction Stop).Source -Destination (Join-Path $outputPath 'node.exe') -Force
    Copy-Item -LiteralPath (Join-Path $outputPath 'WinDockHelper.exe') -Destination $projectRoot -Force
    Write-Output "WINDOWS BUILD OK: $outputPath\WinDockTray.exe"
}
finally { Pop-Location }
