export type BlockId =
  | 'importer'
  | 'diagnostic'
  | 'transformation'
  | 'combiner'
  | 'automation';

export type ViewId = BlockId | 'home';

export interface AppRoute {
  view: ViewId;
  action: string;
}

export const DEFAULT_ROUTE: AppRoute = {
  view: 'diagnostic',
  action: 'scan',
};

/** Lit la vue active depuis les paramètres d'URL (ruban Excel → volet). */
export function parseRouteFromSearch(search: string): AppRoute {
  const params = new URLSearchParams(search);
  const viewParam = params.get('view');
  const action = params.get('action') ?? '';

  const validViews: ViewId[] = [
    'importer',
    'diagnostic',
    'transformation',
    'combiner',
    'automation',
    'home',
  ];

  if (viewParam && validViews.includes(viewParam as ViewId)) {
    return { view: viewParam as ViewId, action };
  }

  return DEFAULT_ROUTE;
}

export function getRouteLabel(route: AppRoute): string {
  const labels: Record<string, Record<string, string>> = {
    home: { '': 'Smart Cleaner AI' },
    importer: {
      file: 'Importer — Fichier Excel/CSV',
      folder: 'Importer — Dossier complet',
      sql: 'Importer — Base SQL/Access',
      web: 'Importer — Lien Web',
    },
    diagnostic: {
      scan: 'Diagnostic — Scanner le tableau',
    },
    transformation: {
      'col-separate': 'Colonnes — Séparer',
      'col-merge-text': 'Colonnes — Fusionner texte',
      'col-extract': 'Colonnes — Extraction IA',
      'col-anonymize': 'Colonnes — Anonymiser RGPD',
      'col-dates': 'Colonnes — Spécial Dates',
      'col-calculated': 'Colonnes — Calculée',
      'col-by-example': 'Colonnes — Par l\'exemple',
      'row-propagate': 'Lignes — Propager',
      'row-isolate': 'Lignes — Isoler lignes suspectes',
    },
    combiner: {
      merge: 'Combiner — Fusionner (Merge)',
      append: 'Combiner — Combiner (Append)',
    },
    automation: {
      reapply: 'Automation — Réappliquer',
      'watch-folder': 'Automation — Suivre Dossier',
    },
  };

  return labels[route.view]?.[route.action] ?? labels[route.view]?.[''] ?? 'Smart Cleaner AI';
}

export interface AppliedStep {
  id: string;
  label: string;
  view: ViewId;
  timestamp: Date;
}
