# Smart Cleaner AI — vider le cache icônes Excel (Windows)
# Fermez Excel AVANT de lancer ce script (clic droit > Exécuter avec PowerShell).

$ErrorActionPreference = 'SilentlyContinue'

Write-Host ''
Write-Host '=== Smart Cleaner AI — Rafraichissement cache Excel ===' -ForegroundColor Cyan
Write-Host ''

$excel = Get-Process EXCEL -ErrorAction SilentlyContinue
if ($excel) {
  Write-Host 'ERREUR : Excel est encore ouvert.' -ForegroundColor Red
  Write-Host 'Fermez Excel completement (toutes les fenetres), puis relancez ce script.'
  Read-Host 'Appuyez sur Entree pour quitter'
  exit 1
}

$paths = @(
  "$env:LOCALAPPDATA\Microsoft\Office\16.0\Wef",
  "$env:LOCALAPPDATA\Microsoft\Office\SolutionPackages"
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Path "$p\*" -Recurse -Force
    Write-Host "OK — cache vide : $p" -ForegroundColor Green
  } else {
    Write-Host "— dossier absent (normal) : $p"
  }
}

Write-Host ''
Write-Host 'Termine. Prochaines etapes :' -ForegroundColor Yellow
Write-Host '  1. Verifiez que votre dossier partage ne contient QUE manifest.xml (pas manifest.dev.xml)'
Write-Host '  2. Ouvrez manifest.xml avec Bloc-notes et cherchez "v3" (pas "v2")'
Write-Host '  3. Rouvrez Excel'
Write-Host ''
Read-Host 'Appuyez sur Entree pour fermer'
