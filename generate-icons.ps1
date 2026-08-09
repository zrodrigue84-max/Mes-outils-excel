$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot "assets"
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir | Out-Null }

$categories = @{
    finance = @{ Bg = [System.Drawing.Color]::FromArgb(255, 37, 99, 235);  Fg = [System.Drawing.Color]::White; Label = "F"; Sub = "FIN" }
    avis    = @{ Bg = [System.Drawing.Color]::FromArgb(255, 16, 185, 129);  Fg = [System.Drawing.Color]::White; Label = "A"; Sub = "AVI" }
    stocks  = @{ Bg = [System.Drawing.Color]::FromArgb(255, 217, 119, 6);   Fg = [System.Drawing.Color]::White; Label = "S"; Sub = "STK" }
}

$sizes = @(16, 32, 80)

function New-PlaceholderIcon {
    param(
        [string]$Name,
        [hashtable]$Cfg,
        [int]$Size
    )

    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)

    $margin = [Math]::Max(1, [int]($Size / 10))
    $radius = [Math]::Max(2, [int]($Size / 6))

    $bgBrush = New-Object System.Drawing.SolidBrush $Cfg.Bg
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, ($radius * 2), ($radius * 2), 180, 90)
    $path.AddArc(($Size - ($radius * 2)), 0, ($radius * 2), ($radius * 2), 270, 90)
    $path.AddArc(($Size - ($radius * 2)), ($Size - ($radius * 2)), ($radius * 2), ($radius * 2), 0, 90)
    $path.AddArc(0, ($Size - ($radius * 2)), ($radius * 2), ($radius * 2), 90, 90)
    $path.CloseFigure()
    $g.FillPath($bgBrush, $path)
    $bgBrush.Dispose()
    $path.Dispose()

    $accent = [System.Drawing.Color]::FromArgb(180, 255, 255, 255)
    $accentBrush = New-Object System.Drawing.SolidBrush $accent
    $barH = [Math]::Max(1, [int]($Size / 8))
    $g.FillRectangle($accentBrush, $margin, ($Size - $margin - $barH), ($Size - ($margin * 2)), $barH)
    $accentBrush.Dispose()

    if ($Size -ge 32) {
        $fontSize = [Math]::Max(10, [int]($Size * 0.38))
        $font = [System.Drawing.Font]::new("Segoe UI", [single]$fontSize, [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush $Cfg.Fg
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF 0, 0, $Size, ($Size - $barH)
        $g.DrawString($Cfg.Label, $font, $textBrush, $rect, $sf)
        $font.Dispose(); $textBrush.Dispose(); $sf.Dispose()
    }
    elseif ($Size -eq 16) {
        $font = [System.Drawing.Font]::new("Segoe UI", [single]7, [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush $Cfg.Fg
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF 0, 0, 16, 16
        $g.DrawString($Cfg.Label, $font, $textBrush, $rect, $sf)
        $font.Dispose(); $textBrush.Dispose(); $sf.Dispose()
    }

    $g.Dispose()

    $outPath = Join-Path $assetsDir ("{0}-{1}.png" -f $Name, $Size)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host ("Created {0} ({1}x{1})" -f (Split-Path $outPath -Leaf), $Size)
    $bmp.Dispose()
}

foreach ($entry in $categories.GetEnumerator()) {
    foreach ($size in $sizes) {
        New-PlaceholderIcon -Name $entry.Key -Cfg $entry.Value -Size $size
    }
}

Write-Host "Done: 9 placeholder icons generated in assets/"
