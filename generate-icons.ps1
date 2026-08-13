$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot "public\assets"
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null }

$cfg = @{
    Bg    = [System.Drawing.Color]::FromArgb(255, 0, 120, 212)
    Fg    = [System.Drawing.Color]::White
    Label = "SC"
}

$sizes = @(16, 32, 80)

function New-SmartCleanerIcon {
    param([int]$Size)

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    $margin = [Math]::Max(1, [int]($Size / 10))
    $radius = [Math]::Max(2, [int]($Size / 6))

    $bgBrush = New-Object System.Drawing.SolidBrush $cfg.Bg
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, ($radius * 2), ($radius * 2), 180, 90)
    $path.AddArc(($Size - ($radius * 2)), 0, ($radius * 2), ($radius * 2), 270, 90)
    $path.AddArc(($Size - ($radius * 2)), ($Size - ($radius * 2)), ($radius * 2), ($radius * 2), 0, 90)
    $path.AddArc(0, ($Size - ($radius * 2)), ($radius * 2), ($radius * 2), 90, 90)
    $path.CloseFigure()
    $g.FillPath($bgBrush, $path)
    $bgBrush.Dispose()
    $path.Dispose()

    $fontSize = if ($Size -ge 32) { [Math]::Max(8, [int]($Size * 0.28)) } else { 5 }
    $font = [System.Drawing.Font]::new("Segoe UI", [single]$fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush $cfg.Fg
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, $Size
    $g.DrawString($cfg.Label, $font, $textBrush, $rect, $sf)
    $font.Dispose(); $textBrush.Dispose(); $sf.Dispose()
    $g.Dispose()

    $outPath = Join-Path $assetsDir ("icon-{0}.png" -f $Size)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host ("Created {0} ({1}x{1})" -f (Split-Path $outPath -Leaf), $Size)
    $bmp.Dispose()
}

foreach ($size in $sizes) {
    New-SmartCleanerIcon -Size $size
}

Write-Host "Done: Smart Cleaner AI icons generated in public/assets/"
