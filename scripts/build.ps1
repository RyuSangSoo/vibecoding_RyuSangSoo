$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$localNode = Get-ChildItem -Path (Join-Path $root ".tools") -Directory -Filter "node-v*-win-x64" -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending |
  Select-Object -First 1

if ($localNode) {
  $env:PATH = "$($localNode.FullName);$env:PATH"
  & (Join-Path $localNode.FullName "npm.cmd") run build
  exit $LASTEXITCODE
}

npm run build
