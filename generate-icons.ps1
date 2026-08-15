# Smart Cleaner AI — Génération des icônes ruban (Fluent UI System Icons)
# Adapté depuis l'ancien script placeholder : délègue à Node + @fluentui/svg-icons + sharp.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "Génération des icônes PNG depuis Fluent UI System Icons..."
npm run generate:icons
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done."
