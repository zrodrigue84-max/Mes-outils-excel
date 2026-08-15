/**
 * Génère des icônes PNG colorées style Office 365 / Fluent Design pour le ruban Excel.
 * Tuile arrondie en dégradé + pictogramme blanc centré (depuis @fluentui/svg-icons).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { RIBBON_ICONS, ICON_VERSION, iconFileName } from './ribbon-icons.js';
import { OFFICE_ICON_STYLES } from './ribbon-icon-styles.js';

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

function whiteGlyph(svgContent) {
  let inner = extractSvgInner(svgContent);
  inner = inner.replace(/fill="[^"]*"/gi, '');
  inner = inner.replace(/stroke="[^"]*"/gi, '');
  inner = inner.replace(/<path/gi, '<path fill="#FFFFFF"');
  inner = inner.replace(/<circle/gi, '<circle fill="#FFFFFF"');
  inner = inner.replace(/<rect/gi, '<rect fill="#FFFFFF"');
  inner = inner.replace(/<polygon/gi, '<polygon fill="#FFFFFF"');
  return inner;
}

function buildOfficeIconSvg(svgContent, style, iconKey) {
  const glyph = whiteGlyph(svgContent);
  const scale = style.glyphScale ?? 0.58;
  const glyphSize = CANVAS * scale;
  const offset = (CANVAS - glyphSize) / 2;
  const uid = iconKey.replace(/[^a-z0-9]/gi, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS}" height="${CANVAS}" viewBox="0 0 ${CANVAS} ${CANVAS}">
  <defs>
    <linearGradient id="bg-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${style.gradientStart}"/>
      <stop offset="100%" stop-color="${style.gradientEnd}"/>
    </linearGradient>
    <linearGradient id="hi-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="sh-${uid}" x="-20%" y="-10%" width="140%" height="150%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" flood-color="#000000" flood-opacity="0.22"/>
    </filter>
  </defs>
  <rect x="1.5" y="2.5" width="29" height="29" rx="7.5" fill="#000000" opacity="0.1"/>
  <rect x="1" y="1" width="30" height="30" rx="7.5" fill="url(#bg-${uid})" filter="url(#sh-${uid})"/>
  <rect x="1" y="1" width="30" height="15" rx="7.5" fill="url(#hi-${uid})"/>
  <g transform="translate(${offset}, ${offset}) scale(${glyphSize / 24})">
    ${glyph}
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
  const style = OFFICE_ICON_STYLES[iconKey];
  if (!style) {
    throw new Error(`Style manquant pour l'icône « ${iconKey} »`);
  }

  const svgPath = path.join(SVG_DIR, svgFile);
  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG introuvable : ${svgPath}`);
  }

  const rawSvg = fs.readFileSync(svgPath, 'utf8');
  const compositeSvg = buildOfficeIconSvg(rawSvg, style, iconKey);

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

  console.log(`\n✅ ${count} icônes PNG colorées (${ICON_VERSION}) dans public/assets/`);
}

main().catch((err) => {
  console.error('❌ Erreur génération icônes :', err.message);
  process.exit(1);
});
