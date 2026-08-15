/**
 * Sources officielles Microsoft Fluent UI System Icons pour le ruban Smart Cleaner AI.
 *
 * mode "color"  → icône Fluent Color officielle utilisée telle quelle (multi-tons Microsoft,
 *                 le même jeu graphique que Teams / Outlook / OneDrive).
 * mode "flat"   → icône Fluent "filled" officielle, recolorée en une seule couleur unie
 *                 (Bleu Office = structure/données, Vert Excel = IA/diagnostic).
 *                 Aucun dégradé, ombre ou effet ajouté : rendu identique aux commandes
 *                 monochromes natives du ruban Excel.
 */
export const BLUE = '#0078d4';
export const GREEN = '#107c41';

export const ICON_SOURCES = {
  // —— Boutons principaux du ruban ——
  open: { file: 'bot_sparkle_24_color.svg', mode: 'color' },
  app: { file: 'bot_sparkle_24_color.svg', mode: 'color' },
  import: { file: 'arrow_download_24_filled.svg', mode: 'flat', color: BLUE },
  scan: { file: 'shield_checkmark_24_color.svg', mode: 'color' },
  columns: { file: 'column_triple_24_filled.svg', mode: 'flat', color: BLUE },
  rows: { file: 'row_triple_24_filled.svg', mode: 'flat', color: BLUE },
  merge: { file: 'link_24_color.svg', mode: 'color' },
  append: { file: 'table_stack_above_24_filled.svg', mode: 'flat', color: BLUE },
  reapply: { file: 'arrow_sync_24_color.svg', mode: 'color' },
  'watch-folder': { file: 'folder_search_24_filled.svg', mode: 'flat', color: BLUE },

  // —— Sous-menu Importer ——
  'import-file': { file: 'table_24_color.svg', mode: 'color' },
  'import-folder': { file: 'folder_24_filled.svg', mode: 'flat', color: BLUE },
  'import-sql': { file: 'database_24_color.svg', mode: 'color' },
  'import-web': { file: 'globe_24_color.svg', mode: 'color' },

  // —— Sous-menu Colonnes ——
  'col-separate': { file: 'split_horizontal_24_filled.svg', mode: 'flat', color: BLUE },
  'col-merge-text': { file: 'merge_24_filled.svg', mode: 'flat', color: BLUE },
  'col-extract': { file: 'brain_circuit_24_filled.svg', mode: 'flat', color: GREEN },
  'col-anonymize': { file: 'lock_shield_24_color.svg', mode: 'color' },
  'col-dates': { file: 'calendar_24_color.svg', mode: 'color' },
  'col-calculated': { file: 'math_formula_24_filled.svg', mode: 'flat', color: BLUE },
  'col-by-example': { file: 'wand_24_filled.svg', mode: 'flat', color: GREEN },

  // —— Sous-menu Lignes ——
  'row-propagate': { file: 'arrow_autofit_down_24_filled.svg', mode: 'flat', color: BLUE },
  'row-isolate': { file: 'warning_24_color.svg', mode: 'color' },
};

export const RIBBON_ICON_KEYS = Object.keys(ICON_SOURCES);
