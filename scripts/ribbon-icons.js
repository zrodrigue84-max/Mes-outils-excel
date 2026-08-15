/**
 * Pictogrammes Fluent UI — ruban principal + sous-menus.
 * Rendu final : tuiles colorées Office 365 (voir generate-ribbon-icons.js).
 * ICON_VERSION : incrémenter à chaque changement visuel pour invalider le cache Excel.
 */
export const ICON_VERSION = 'v3';

export const RIBBON_ICONS = {
  // —— Boutons principaux du ruban ——
  open: 'sparkle_24_filled.svg',
  import: 'arrow_download_24_filled.svg',
  scan: 'scan_24_filled.svg',
  columns: 'column_triple_24_filled.svg',
  rows: 'row_triple_24_filled.svg',
  merge: 'link_24_filled.svg',
  append: 'stack_24_filled.svg',
  reapply: 'arrow_sync_24_filled.svg',
  'watch-folder': 'folder_sync_24_filled.svg',
  app: 'sparkle_24_filled.svg',

  // —— Sous-menu Importer ——
  'import-file': 'document_table_24_filled.svg',
  'import-folder': 'folder_24_filled.svg',
  'import-sql': 'database_24_filled.svg',
  'import-web': 'globe_24_filled.svg',

  // —— Sous-menu Colonnes ——
  'col-separate': 'split_horizontal_24_filled.svg',
  'col-merge-text': 'merge_24_filled.svg',
  'col-extract': 'sparkle_24_filled.svg',
  'col-anonymize': 'shield_24_filled.svg',
  'col-dates': 'calendar_24_filled.svg',
  'col-calculated': 'calculator_24_filled.svg',
  'col-by-example': 'lightbulb_24_filled.svg',

  // —— Sous-menu Lignes ——
  'row-propagate': 'arrow_autofit_down_24_filled.svg',
  'row-isolate': 'filter_24_filled.svg',
};

/** Nom de fichier PNG versionné (cache-busting Office). */
export function iconFileName(iconKey, size) {
  if (iconKey === 'app') {
    return `icon-${size}-${ICON_VERSION}.png`;
  }
  return `icon-${iconKey}-${size}-${ICON_VERSION}.png`;
}
