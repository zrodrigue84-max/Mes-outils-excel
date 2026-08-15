/**
 * Pictogrammes Fluent UI — ruban principal + sous-menus.
 * Rendu final : formes détourées Office 365 (voir generate-ribbon-icons.js).
 * ICON_VERSION : incrémenter à chaque changement visuel pour invalider le cache Excel.
 */
export const ICON_VERSION = 'v4';

export const RIBBON_ICONS = {
  // —— Boutons principaux du ruban ——
  open: 'sparkle_24_regular.svg',
  import: 'arrow_download_24_regular.svg',
  scan: 'scan_24_regular.svg',
  columns: 'column_triple_24_regular.svg',
  rows: 'row_triple_24_regular.svg',
  merge: 'link_24_regular.svg',
  append: 'stack_24_regular.svg',
  reapply: 'arrow_sync_24_regular.svg',
  'watch-folder': 'folder_sync_24_regular.svg',
  app: 'sparkle_24_regular.svg',

  // —— Sous-menu Importer ——
  'import-file': 'document_table_24_regular.svg',
  'import-folder': 'folder_24_regular.svg',
  'import-sql': 'database_24_regular.svg',
  'import-web': 'globe_24_regular.svg',

  // —— Sous-menu Colonnes ——
  'col-separate': 'split_horizontal_24_regular.svg',
  'col-merge-text': 'merge_24_regular.svg',
  'col-extract': 'sparkle_24_regular.svg',
  'col-anonymize': 'shield_24_regular.svg',
  'col-dates': 'calendar_24_regular.svg',
  'col-calculated': 'calculator_24_regular.svg',
  'col-by-example': 'lightbulb_24_regular.svg',

  // —— Sous-menu Lignes ——
  'row-propagate': 'arrow_autofit_down_24_regular.svg',
  'row-isolate': 'filter_24_regular.svg',
};

/** Nom de fichier PNG versionné (cache-busting Office). */
export function iconFileName(iconKey, size) {
  if (iconKey === 'app') {
    return `icon-${size}-${ICON_VERSION}.png`;
  }
  return `icon-${iconKey}-${size}-${ICON_VERSION}.png`;
}
