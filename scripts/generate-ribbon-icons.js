/**
 * Génère les PNG du ruban depuis les SVG sur mesure (custom-ribbon-svgs.js).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { ICON_VERSION, iconFileName } from './ribbon-icons.js';
import { CUSTOM_RIBBON_SVGS, RIBBON_ICON_KEYS } from './custom-ribbon-svgs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const OUT_DIR = path.join(root, 'public', 'assets');

const SIZES = [16, 32, 80];

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

async function renderPng(iconKey, size) {
  const svg = CUSTOM_RIBBON_SVGS[iconKey];
  if (!svg) {
    throw new Error(`SVG manquant pour « ${iconKey} »`);
  }

  const pngBuffer = await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size, {
      fit: 'contain',
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
  for (const key of RIBBON_ICON_KEYS) {
    for (const size of SIZES) {
      const out = await renderPng(key, size);
      console.log(`✓ ${path.basename(out)}`);
      count++;
    }
  }

  console.log(`\n✅ ${count} icônes PNG premium (${ICON_VERSION}) dans public/assets/`);
}

main().catch((err) => {
  console.error('❌ Erreur génération icônes :', err.message);
  process.exit(1);
});
