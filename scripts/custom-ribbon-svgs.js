/**
 * Icônes SVG sur mesure — style Fluent UI System Icons (Microsoft 365).
 * Silhouettes détourées, trait 2px, sans fond. Bleu Office + Vert Excel uniquement.
 */
export const BLUE = '#0078d4';
export const GREEN = '#107c41';
export const EXCEL_GREEN = '#217346';
export const FOLDER_YELLOW = '#FFB900';
export const WARN = '#CA5010';

const W = 2;
const CAP = 'round';
const JOIN = 'round';

function svgBody(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">${content}</svg>`;
}

export const CUSTOM_RIBBON_SVGS = {
  // —— Principal ——
  open: svgBody(`
    <rect x="3.5" y="5" width="11" height="14" rx="1.5" stroke="${GREEN}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M7 9.5h5M7 12.5h4M7 15.5h5" stroke="${GREEN}" stroke-width="1.5" stroke-linecap="${CAP}"/>
    <path d="M17.2 7.2l.9 1.8 2 .3-1.45 1.4.35 2L17.2 11.8l-1.8.95.35-2-1.45-1.4 2-.3.9-1.85z" fill="${GREEN}" stroke="${GREEN}" stroke-width="0.5" stroke-linejoin="${JOIN}"/>
    <path d="M19.5 5.5l.55 1.1 1.2.18-.87.84.2 1.18-1.08-.57-1.08.57.2-1.18-.87-.84 1.2-.18.55-1.1z" fill="${GREEN}"/>
  `),

  app: null, // alias → open (filled below)

  import: svgBody(`
    <rect x="5" y="3" width="11" height="14" rx="1.2" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M5 7h11" stroke="${BLUE}" stroke-width="1.5"/>
    <path d="M8.5 10.5h4M8.5 13h4" stroke="${BLUE}" stroke-width="1.5" stroke-linecap="${CAP}"/>
    <path d="M12 17v4M9.5 20.5 12 23 14.5 20.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
  `),

  scan: svgBody(`
    <path d="M12 3.5 18.5 6.2v5.3c0 3.85-2.6 6.15-6.5 8.5-3.9-2.35-6.5-4.65-6.5-8.5V6.2L12 3.5z" stroke="${GREEN}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M9.2 12.2 11 14l3.8-4.2" stroke="${GREEN}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <circle cx="12" cy="9.5" r="1.2" fill="${GREEN}"/>
  `),

  columns: svgBody(`
    <rect x="5" y="4" width="4.5" height="16" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <rect x="14.5" y="4" width="4.5" height="16" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M10.5 8h3M10.5 12h3M10.5 16h3" stroke="${BLUE}" stroke-width="1.5" stroke-linecap="${CAP}" opacity="0.45"/>
  `),

  rows: svgBody(`
    <rect x="4" y="5" width="16" height="4.5" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <rect x="4" y="14.5" width="16" height="4.5" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M8 10.5v3M12 10.5v3M16 10.5v3" stroke="${BLUE}" stroke-width="1.5" stroke-linecap="${CAP}" opacity="0.45"/>
  `),

  merge: svgBody(`
    <path d="M4 9.5h6M4 14.5h6" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <path d="M10 9.5 13 12l-3 2.5M10 14.5 13 12l-3-2.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M14 9.5h6M14 14.5h6" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <path d="M14 9.5 11 12l3 2.5M14 14.5 11 12l3-2.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
  `),

  append: svgBody(`
    <rect x="5" y="4" width="10" height="7" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <rect x="9" y="13" width="10" height="7" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M10 11.5v1.5M12 10v4" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <circle cx="10" cy="12.5" r="1" fill="${BLUE}"/>
    <circle cx="14" cy="16.5" r="1" fill="${BLUE}"/>
  `),

  reapply: svgBody(`
    <path d="M12 5a7 7 0 1 1-4.95 2.05" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M5.5 5.5V9H9" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M12 19a7 7 0 1 0 4.95-2.05" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M18.5 18.5V15H15" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
  `),

  'watch-folder': svgBody(`
    <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6H9l1.5 2h7A1.5 1.5 0 0 1 19 9.5V17a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17V7.5z" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <circle cx="16.5" cy="15.5" r="3.25" stroke="${BLUE}" stroke-width="${W}"/>
    <path d="M18.7 17.7 21 20" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
  `),

  // —— Sous-menu Importer ——
  'import-file': svgBody(`
    <path d="M6 3h7l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M13 3v4h4" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M6 3v4h5V3" fill="${EXCEL_GREEN}"/>
    <path d="M8 10h6M8 13h6M8 16h4" stroke="${EXCEL_GREEN}" stroke-width="1.3" stroke-linecap="${CAP}"/>
  `),

  'import-folder': svgBody(`
    <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H9l1.5 2h8A1.5 1.5 0 0 1 20 10.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V8.5z" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M3 10.5h17" stroke="${FOLDER_YELLOW}" stroke-width="3" stroke-linecap="${CAP}" opacity="0.85"/>
    <path d="M4.5 7 6 9.5h12" stroke="${FOLDER_YELLOW}" stroke-width="2" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}" fill="none"/>
  `),

  'import-sql': svgBody(`
    <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" stroke="${BLUE}" stroke-width="${W}"/>
    <path d="M5.5 6.5v9c0 1.38 2.91 2.5 6.5 2.5s6.5-1.12 6.5-2.5v-9" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M5.5 11c0 1.38 2.91 2.5 6.5 2.5s6.5-1.12 6.5-2.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
  `),

  'import-web': svgBody(`
    <circle cx="12" cy="12" r="7.5" stroke="${BLUE}" stroke-width="${W}"/>
    <path d="M4.5 12h15M12 4.5c2.5 2.8 3.8 5.6 3.8 7.5S14.5 16.7 12 19.5M12 4.5C9.5 7.3 8.2 10.1 8.2 12s1.3 4.7 3.8 7.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <path d="M6.5 8h11M6.5 16h11" stroke="${BLUE}" stroke-width="1.3" stroke-linecap="${CAP}" opacity="0.5"/>
  `),

  // —— Sous-menu Colonnes ——
  'col-separate': svgBody(`
    <rect x="4" y="5" width="5" height="14" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <rect x="15" y="5" width="5" height="14" rx="1" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M12 6v12" stroke="${BLUE}" stroke-width="1.5" stroke-dasharray="2 2" stroke-linecap="${CAP}"/>
  `),

  'col-merge-text': svgBody(`
    <rect x="3.5" y="6" width="5" height="4" rx="0.8" stroke="${BLUE}" stroke-width="${W}"/>
    <rect x="3.5" y="14" width="5" height="4" rx="0.8" stroke="${BLUE}" stroke-width="${W}"/>
    <path d="M9 8h2.5M9 16h2.5" stroke="${BLUE}" stroke-width="1.3" stroke-linecap="${CAP}"/>
    <path d="M14 12h3.5M17.5 12 15.5 10M17.5 12 15.5 14" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <rect x="15.5" y="9.5" width="5" height="5" rx="0.8" stroke="${BLUE}" stroke-width="${W}"/>
  `),

  'col-extract': svgBody(`
    <rect x="6" y="6" width="12" height="12" rx="2" stroke="${GREEN}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M9 9h2v2H9zM13 9h2v2h-2zM9 13h2v2H9zM13 13h2v2h-2z" fill="${GREEN}"/>
    <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" stroke="${GREEN}" stroke-width="1.5" stroke-linecap="${CAP}"/>
  `),

  'col-anonymize': svgBody(`
    <circle cx="9.5" cy="9" r="3" stroke="${BLUE}" stroke-width="${W}"/>
    <path d="M4.5 18c0-2.76 2.24-5 5-5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <rect x="14.5" y="13" width="5.5" height="4.5" rx="1" stroke="${BLUE}" stroke-width="${W}"/>
    <path d="M16 13v-1.2a1.2 1.2 0 0 1 2.4 0V13" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <circle cx="17.2" cy="15.2" r="0.8" fill="${BLUE}"/>
  `),

  'col-dates': svgBody(`
    <rect x="4" y="6" width="16" height="14" rx="1.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M4 10h16M8 4v3M16 4v3" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <path d="M8.5 14h2v2h-2zM11.5 14h2v2h-2zM14.5 14h2v2h-2z" fill="${BLUE}"/>
  `),

  'col-calculated': svgBody(`
    <rect x="4" y="5" width="16" height="14" rx="1.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <text x="12" y="15.5" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="7.5" font-weight="600" fill="${BLUE}">f(x)</text>
  `),

  'col-by-example': svgBody(`
    <path d="M5 19L16 8" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <path d="M13 6l3 3-3 3" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M17.5 4.5l.6 1.2 1.3.2-1 .96.24 1.26-.96-.52-.96.52.24-1.26-1-.96 1.3-.2.6-1.2z" fill="${GREEN}"/>
    <path d="M19.5 8.5l.45.9 1 .15-.75.72.18 1.02-.88-.46-.88.46.18-1.02-.75-.72 1-.15.45-.9z" fill="${GREEN}"/>
  `),

  // —— Sous-menu Lignes ——
  'row-propagate': svgBody(`
    <path d="M5 12h14" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}"/>
    <path d="M12 5v3M9.5 6.5 12 5l2.5 1.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M12 19v-3M9.5 17.5 12 19l2.5-1.5" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
  `),

  'row-isolate': svgBody(`
    <rect x="4" y="5" width="16" height="14" rx="1.2" stroke="${BLUE}" stroke-width="${W}" stroke-linecap="${CAP}" stroke-linejoin="${JOIN}"/>
    <path d="M4 10h16M4 14h16" stroke="${BLUE}" stroke-width="1.3" opacity="0.4"/>
    <rect x="4" y="10" width="16" height="4" fill="${GREEN}" fill-opacity="0.15" stroke="${GREEN}" stroke-width="${W}"/>
    <circle cx="19" cy="7" r="2.2" fill="${WARN}" stroke="none"/>
    <path d="M19 5.8v2.4M19 9.5v.01" stroke="#fff" stroke-width="1.3" stroke-linecap="${CAP}"/>
  `),
};

CUSTOM_RIBBON_SVGS.app = CUSTOM_RIBBON_SVGS.open;

/** Clés d'icônes dans l'ordre du manifest. */
export const RIBBON_ICON_KEYS = Object.keys(CUSTOM_RIBBON_SVGS);
