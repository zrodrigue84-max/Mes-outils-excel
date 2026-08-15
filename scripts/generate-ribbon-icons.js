/**
 * Génère des icônes PNG style ruban Office 365 pour Smart Cleaner AI.
 * Formes détourées sans fond, 3 couleurs, dégradés subtils + léger relief Fluent.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { RIBBON_ICONS, ICON_VERSION, iconFileName } from './ribbon-icons.js';
import { PALETTES, ICON_PALETTE, ICON_GLYPH_SCALE } from './ribbon-icon-styles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SVG_DIR = path.join(root, 'node_modules', '@fluentui', 'svg-icons', 'icons');
const OUT_DIR = path.join(root, 'public', 'assets');

const CANVAS = 32;
const SIZES = [16, 32, 80];

function extractSvgInner(svgContent) {
  const match = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match ? match[1].trim() : '';
}

function gradientGlyph(svgContent, gradientId) {
  let inner = extractSvgInner(svgContent);
  inner = inner.replace(/fill="[^"]*"/gi, '');
  inner = inner.replace(/stroke="[^"]*"/gi, '');
  inner = inner.replace(/<path/gi, `<path fill="url(#${gradientId})"`);
  inner = inner.replace(/<circle/gi, `<circle fill="url(#${gradientId})"`);
  inner = inner.replace(/<rect/gi, `<rect fill="url(#${gradientId})"`);
  inner = inner.replace(/<polygon/gi, `<polygon fill="url(#${gradientId})"`);
  return inner;
}

function buildFluentRibbonIconSvg(svgContent, iconKey) {
  const paletteKey = ICON_PALETTE[iconKey];
  const colors = PALETTES[paletteKey];
  if (!colors) {
    throw new Error(`Palette manquante pour « ${iconKey} »`);
  }

  const uid = iconKey.replace(/[^a-z0-9]/gi, '');
  const gradMain = `g-main-${uid}`;
  const gradDepth = `g-depth-${uid}`;
  const glyph = gradientGlyph(svgContent, gradMain);

  const glyphSize = CANVAS * ICON_GLYPH_SCALE;
  const offset = (CANVAS - glyphSize) / 2;
  const scale = glyphSize / 24;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <defs>
    <linearGradient id="${gradMain}" x1="18%" y1="8%" x2="82%" y2="92%">
      <stop offset="0%" stop-color="${colors.light}"/>
      <stop offset="48%" stop-color="${colors.mid}"/>
      <stop offset="100%" stop-color="${colors.dark}"/>
    </linearGradient>
    <linearGradient id="${gradDepth}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="42%" stop-color="#FFFFFF" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
    </linearGradient>
    <filter id="sh-${uid}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0.6" stdDeviation="0.45" flood-color="${colors.dark}" flood-opacity="0.28"/>
    </filter>
  </defs>
  <g filter="url(#sh-${uid})">
    <g transform="translate(${offset + 0.3}, ${offset + 0.55}) scale(${scale})" opacity="0.22">
      ${glyph.replaceAll(`url(#${gradMain})`, colors.dark)}
    </g>
    <g transform="translate(${offset}, ${offset}) scale(${scale})">
      ${glyph}
    </g>
    <g transform="translate(${offset}, ${offset}) scale(${scale})" style="mix-blend-mode: overlay" opacity="0.35">
      <rect x="0" y="0" width="24" height="11" fill="url(#${gradDepth})"/>
    </g>
  </g>
</svg>`;
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
  const compositeSvg = buildFluentRibbonIconSvg(rawSvg, iconKey);

  const pngBuffer = await sharp(Buffer.from(compositeSvg), { density: 300 })
    .resize(size, size, { fit: 'fill', background: { r: 0, g: 0, b: 0, alpha: 0 } })
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

  console.log(`\n✅ ${count} icônes PNG Fluent Office (${ICON_VERSION}) dans public/assets/`);
}

main().catch((err) => {
  console.error('❌ Erreur génération icônes :', err.message);
  process.exit(1);
});
