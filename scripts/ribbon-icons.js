/**
 * Icônes ruban Smart Cleaner AI — SVG sur mesure (custom-ribbon-svgs.js).
 * ICON_VERSION : incrémenter à chaque changement visuel pour invalider le cache Excel.
 */
import { RIBBON_ICON_KEYS } from './custom-ribbon-svgs.js';

export const ICON_VERSION = 'v5';

/** Liste des clés d'icônes (ruban + sous-menus). */
export const RIBBON_ICONS = Object.fromEntries(RIBBON_ICON_KEYS.map((key) => [key, key]));

/** Nom de fichier PNG versionné (cache-busting Office). */
export function iconFileName(iconKey, size) {
  if (iconKey === 'app') {
    return `icon-${size}-${ICON_VERSION}.png`;
  }
  return `icon-${iconKey}-${size}-${ICON_VERSION}.png`;
}
