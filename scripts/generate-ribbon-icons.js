/**
 * Génère les PNG du ruban à partir des icônes OFFICIELLES Microsoft Fluent UI System Icons
 * (@fluentui/svg-icons). Aucune forme n'est inventée : on utilise soit l'icône "Color"
 * multi-tons officielle telle quelle, soit l'icône "filled" officielle recolorée en une
 * seule couleur unie (Bleu Office / Vert Excel), sans dégradé ni ombre ajoutés.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { ICON_VERSION, iconFileName } from './ribbon-icons.js';
import { ICON_SOURCES, RIBBON_ICON_KEYS } from './ribbon-icon-sources.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SVG_DIR = path.join(root, 'node_modules', '@fluentui', 'svg-icons', 'icons');
const OUT_DIR = path.join(root, 'public', 'assets');

const SIZES = [16, 32, 80];
/** Marge intérieure pour que l'icône respire dans le canevas du ruban. */
const PADDING_RATIO = 0.08;

function recolorFlat(svgContent, color) {
  let svg = svgContent;
  svg = svg.replace(/fill="(?!none")[^"]*"/gi, `fill="${color}"`);
  svg = svg.replace(/<path(?![^>]*fill=)/gi, `<path fill="${color}"`);
  svg = svg.replace(/<circle(?![^>]*fill=)/gi, `<circle fill="${color}"`);
  svg = svg.replace(/<rect(?![^>]*fill=)/gi, `<rect fill="${color}"`);
  svg = svg.replace(/<polygon(?![^>]*fill=)/gi, `<polygon fill="${color}"`);
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

async function renderPng(iconKey, size) {
  const source = ICON_SOURCES[iconKey];
  if (!source) {
    throw new Error(`Source manquante pour « ${iconKey} »`);
  }

  const svgPath = path.join(SVG_DIR, source.file);
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Icône Fluent UI introuvable : ${svgPath}`);
  }

  const rawSvg = fs.readFileSync(svgPath, 'utf8');
  const svg = source.mode === 'flat' ? recolorFlat(rawSvg, source.color) : rawSvg;

  const padding = Math.round(size * PADDING_RATIO);
  const inner = size - padding * 2;

  const pngBuffer = await sharp(Buffer.from(svg), { density: 384 })
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
  for (const key of RIBBON_ICON_KEYS) {
    for (const size of SIZES) {
      const out = await renderPng(key, size);
      console.log(`✓ ${path.basename(out)}`);
      count++;
    }
  }

  console.log(`\n✅ ${count} icônes PNG officielles Fluent UI (${ICON_VERSION}) dans public/assets/`);
}

main().catch((err) => {
  console.error('❌ Erreur génération icônes :', err.message);
  process.exit(1);
});
