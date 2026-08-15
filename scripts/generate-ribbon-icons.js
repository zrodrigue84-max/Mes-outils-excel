/**
 * Génère les icônes PNG du ruban depuis Fluent UI System Icons (@fluentui/svg-icons).
 * Fichiers versionnés (ex: icon-scan-32-v2.png) pour invalider le cache Excel.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { RIBBON_ICONS, ICON_VERSION, iconFileName } from './ribbon-icons.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SVG_DIR = path.join(root, 'node_modules', '@fluentui', 'svg-icons', 'icons');
const OUT_DIR = path.join(root, 'public', 'assets');

const BRAND = '#0078D4';
const SIZES = [16, 32, 80];

function tintSvg(svgContent, color) {
  let svg = svgContent;
  svg = svg.replace(/fill="[^"]*"/gi, '');
  svg = svg.replace(/<path /gi, `<path fill="${color}" `);
  svg = svg.replace(/<svg /, `<svg fill="${color}" `);
  return svg;
}

function cleanObsoleteIcons() {
  if (!fs.existsSync(OUT_DIR)) return;
  const keepPattern = new RegExp(`-${ICON_VERSION}\\.png$`);
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.startsWith('icon') && file.endsWith('.png') && !keepPattern.test(file)) {
      fs.unlinkSync(path.join(OUT_DIR, file));
      console.log(`🗑  Supprimé (obsolète) : ${file}`);
    }
  }
}

async function renderPng(svgFile, iconKey, size) {
  const svgPath = path.join(SVG_DIR, svgFile);
  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG introuvable : ${svgPath}`);
  }

  const rawSvg = fs.readFileSync(svgPath, 'utf8');
  const svg = tintSvg(rawSvg, BRAND);
  const padding = Math.max(1, Math.round(size * 0.12));
  const inner = size - padding * 2;

  const pngBuffer = await sharp(Buffer.from(svg), { density: 300 })
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const fileName = iconFileName(iconKey, size);
  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, pngBuffer);
  return outPath;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  cleanObsoleteIcons();

  let count = 0;
  for (const [key, svgFile] of Object.entries(RIBBON_ICONS)) {
    for (const size of SIZES) {
      const out = await renderPng(svgFile, key, size);
      console.log(`✓ ${path.basename(out)}`);
      count++;
    }
  }

  console.log(`\n✅ ${count} icônes PNG (${ICON_VERSION}) dans public/assets/`);
}

main().catch((err) => {
  console.error('❌ Erreur génération icônes :', err.message);
  process.exit(1);
});
