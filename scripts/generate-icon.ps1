$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$buildDir = Join-Path $root "assets\\desktop"
$pngPath = Join-Path $buildDir "icon.png"
$icoPath = Join-Path $buildDir "icon.ico"
$convertScript = Join-Path $PSScriptRoot "png-to-ico.mjs"

New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

Add-Type -AssemblyName System.Drawing

$size = 1024
$bitmap = New-Object System.Drawing.Bitmap $size, $size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::FromArgb(244, 239, 226))

$backgroundRect = New-Object System.Drawing.RectangleF 56, 56, 912, 912
$backgroundPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 220
$diameter = $radius * 2
$backgroundPath.AddArc($backgroundRect.X, $backgroundRect.Y, $diameter, $diameter, 180, 90)
$backgroundPath.AddArc($backgroundRect.Right - $diameter, $backgroundRect.Y, $diameter, $diameter, 270, 90)
$backgroundPath.AddArc($backgroundRect.Right - $diameter, $backgroundRect.Bottom - $diameter, $diameter, $diameter, 0, 90)
$backgroundPath.AddArc($backgroundRect.X, $backgroundRect.Bottom - $diameter, $diameter, $diameter, 90, 90)
$backgroundPath.CloseFigure()

$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point -ArgumentList 56, 56),
  (New-Object System.Drawing.Point -ArgumentList 968, 968),
  ([System.Drawing.Color]::FromArgb(34, 59, 76)),
  ([System.Drawing.Color]::FromArgb(201, 121, 67))
)
$graphics.FillPath($bgBrush, $backgroundPath)

$penMain = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(248, 245, 236)), 38
$penMain.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penMain.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$penMain.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

$penAccent = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 214, 173)), 22
$penAccent.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$penAccent.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$penAccent.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

$armPoints = @(
  (New-Object System.Drawing.PointF 260, 730),
  (New-Object System.Drawing.PointF 390, 600),
  (New-Object System.Drawing.PointF 560, 470),
  (New-Object System.Drawing.PointF 720, 318)
)

$graphics.DrawLine($penMain, $armPoints[0], $armPoints[1])
$graphics.DrawLine($penMain, $armPoints[1], $armPoints[2])
$graphics.DrawLine($penMain, $armPoints[2], $armPoints[3])

$graphics.DrawLine($penAccent, 725, 320, 807, 252)
$graphics.DrawLine($penAccent, 725, 320, 828, 338)

$jointBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(250, 248, 242))
$jointAccentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(228, 160, 91))

foreach ($point in $armPoints[0..2]) {
  $graphics.FillEllipse($jointBrush, $point.X - 32, $point.Y - 32, 64, 64)
  $graphics.FillEllipse($jointAccentBrush, $point.X - 13, $point.Y - 13, 26, 26)
}

$toolPoint = $armPoints[3]
$graphics.FillEllipse($jointAccentBrush, $toolPoint.X - 30, $toolPoint.Y - 30, 60, 60)

$baseBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 238, 227))
$graphics.FillRectangle($baseBrush, 210, 760, 150, 56)
$graphics.FillEllipse($jointAccentBrush, 248, 704, 74, 74)

$font = New-Object System.Drawing.Font("Segoe UI", 148, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 241))
$graphics.DrawString("K", $font, $textBrush, 108, 124)

$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$bitmap.Dispose()
$backgroundPath.Dispose()
$bgBrush.Dispose()
$penMain.Dispose()
$penAccent.Dispose()
$jointBrush.Dispose()
$jointAccentBrush.Dispose()
$baseBrush.Dispose()
$font.Dispose()
$textBrush.Dispose()

$localNode = Get-ChildItem -Path (Join-Path $root ".tools") -Directory -Filter "node-v*-win-x64" -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending |
  Select-Object -First 1

if ($localNode) {
  $env:PATH = "$($localNode.FullName);$env:PATH"
}

node $convertScript $pngPath $icoPath

Write-Output "Generated icon files:"
Write-Output $pngPath
Write-Output $icoPath
