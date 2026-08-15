/**
 * Charte graphique Smart Cleaner AI — 3 couleurs max (style ruban Office 365).
 * Pas de fond coloré : dégradé subtil appliqué sur la forme de l'icône elle-même.
 */
export const PALETTES = {
  /** Bleu marque Smart Cleaner AI */
  blue: {
    light: '#60CDFF',
    mid: '#0078D4',
    dark: '#004578',
  },
  /** Vert Excel */
  green: {
    light: '#6FD66F',
    mid: '#107C10',
    dark: '#185C37',
  },
  /** Accentuation (fonctions IA / assistant) */
  accent: {
    light: '#C8B6FF',
    mid: '#8764B8',
    dark: '#5C2D91',
  },
};

/** Palette assignée à chaque icône du ruban. */
export const ICON_PALETTE = {
  open: 'accent',
  app: 'accent',

  import: 'blue',
  'import-file': 'blue',
  'import-folder': 'blue',
  'import-sql': 'blue',
  'import-web': 'blue',

  scan: 'green',

  columns: 'blue',
  'col-separate': 'blue',
  'col-merge-text': 'blue',
  'col-extract': 'accent',
  'col-anonymize': 'blue',
  'col-dates': 'blue',
  'col-calculated': 'blue',
  'col-by-example': 'accent',

  rows: 'blue',
  'row-propagate': 'green',
  'row-isolate': 'blue',

  merge: 'blue',
  append: 'blue',

  reapply: 'green',
  'watch-folder': 'green',
};

/** Échelle du pictogramme dans le canvas (sans tuile de fond). */
export const ICON_GLYPH_SCALE = 0.72;
