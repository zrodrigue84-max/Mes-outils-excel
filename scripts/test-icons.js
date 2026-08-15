/**
 * Vérifie que tous les PNG versionnés référencés existent sur disque.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RIBBON_ICONS, iconFileName } from './ribbon-icons.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '..', 'public', 'assets');
const SIZES = [16, 32, 80];

let missing = 0;
for (const iconKey of Object.keys(RIBBON_ICONS)) {
  for (const size of SIZES) {
    const file = iconFileName(iconKey, size);
    const full = path.join(assetsDir, file);
    if (!fs.existsSync(full)) {
      console.error(`❌ Manquant : ${file}`);
      missing++;
    }
  }
}

if (missing > 0) {
  console.error(`\n❌ ${missing} fichier(s) d'icône manquant(s). Lancez npm run generate:icons`);
  process.exit(1);
}

console.log(`✅ ${Object.keys(RIBBON_ICONS).length * SIZES.length} icônes PNG versionnées présentes`);
