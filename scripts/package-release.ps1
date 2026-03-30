$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $root "release"
$stagingDir = Join-Path $releaseDir "KineLab-Release-Package"
$packageDir = Join-Path $stagingDir "Release"
$zipPath = Join-Path $releaseDir "KineLab-Release-Package-0.1.0.zip"
$portableExe = Join-Path $releaseDir "KineLab-Portable-0.1.0.exe"
$setupExe = Join-Path $releaseDir "KineLab-Setup-0.1.0.exe"
$readmeSource = Join-Path $root "docs\\release-package-readme.md"
$readmeTarget = Join-Path $stagingDir "README.md"

if (-not (Test-Path $portableExe)) {
  throw "Portable exe not found: $portableExe"
}

if (-not (Test-Path $setupExe)) {
  throw "Setup exe not found: $setupExe"
}

if (Test-Path $stagingDir) {
  Remove-Item -Recurse -Force $stagingDir
}

if (Test-Path $zipPath) {
  Remove-Item -Force $zipPath
}

New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
Copy-Item $portableExe $packageDir -Force
Copy-Item $setupExe $packageDir -Force
Copy-Item $readmeSource $readmeTarget -Force

Compress-Archive -Path $stagingDir -DestinationPath $zipPath -Force

Write-Output "Created release package:"
Write-Output $zipPath
