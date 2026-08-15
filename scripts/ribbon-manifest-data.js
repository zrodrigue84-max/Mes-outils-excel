/**
 * Données du ruban Excel — section 2 du cahier des charges Smart Cleaner AI.
 * Utilisé pour générer manifest.xml et manifest.dev.xml.
 */

export const RIBBON_BASE = {
  id: '11111111-2222-3333-4444-555555555556',
  version: '3.4.0.0',
  taskpaneId: 'SmartCleanerPane',
};

/** Bouton « Ouvrir » conservé en attendant validation point 2. */
export const OPEN_BUTTON = {
  id: 'BtnOpenSmartCleaner',
  label: 'Ouvrir Smart Cleaner AI',
  desc: 'Ouvre le volet Smart Cleaner AI sur la vue d\'accueil.',
  url: 'taskpane.html?view=home',
  icon: 'open',
};

export const RIBBON_GROUPS = [
  {
    id: 'GroupImporter',
    label: 'Importer',
    controls: [
      {
        type: 'menu',
        id: 'MenuImporter',
        label: 'Importer',
        desc: 'Charger des données depuis Excel, CSV, dossier, SQL ou le Web.',
        icon: 'import',
        items: [
          { id: 'ImportFile', label: 'Fichier Excel/CSV', view: 'importer', action: 'file', icon: 'import-file' },
          { id: 'ImportFolder', label: 'Dossier complet', view: 'importer', action: 'folder', icon: 'import-folder' },
          { id: 'ImportSql', label: 'Base SQL/Access', view: 'importer', action: 'sql', icon: 'import-sql' },
          { id: 'ImportWeb', label: 'Lien Web (URL)', view: 'importer', action: 'web', icon: 'import-web' },
        ],
      },
    ],
  },
  {
    id: 'GroupDiagnostic',
    label: 'Diagnostic',
    controls: [
      {
        type: 'button',
        id: 'BtnScanner',
        label: 'Scanner',
        desc: 'Ouvre le volet sur le diagnostic et lance l\'analyse clinique instantanée.',
        view: 'diagnostic',
        action: 'scan',
        icon: 'scan',
      },
    ],
  },
  {
    id: 'GroupTransformation',
    label: 'Transformation',
    controls: [
      {
        type: 'menu',
        id: 'MenuColonnes',
        label: 'Colonnes',
        desc: 'Séparer, fusionner, extraire, anonymiser ou calculer des colonnes.',
        icon: 'columns',
        items: [
          { id: 'ColSeparate', label: 'Séparer', view: 'transformation', action: 'col-separate', icon: 'col-separate' },
          { id: 'ColMergeText', label: 'Fusionner texte', view: 'transformation', action: 'col-merge-text', icon: 'col-merge-text' },
          { id: 'ColExtract', label: 'Extraction IA', view: 'transformation', action: 'col-extract', icon: 'col-extract' },
          { id: 'ColAnonymize', label: 'Anonymiser RGPD', view: 'transformation', action: 'col-anonymize', icon: 'col-anonymize' },
          { id: 'ColDates', label: 'Spécial Dates', view: 'transformation', action: 'col-dates', icon: 'col-dates' },
          { id: 'ColCalculated', label: 'Calculée', view: 'transformation', action: 'col-calculated', icon: 'col-calculated' },
          { id: 'ColByExample', label: 'Par l\'exemple', view: 'transformation', action: 'col-by-example', icon: 'col-by-example' },
        ],
      },
      {
        type: 'menu',
        id: 'MenuLignes',
        label: 'Lignes',
        desc: 'Propager des valeurs ou isoler des lignes suspectes.',
        icon: 'rows',
        items: [
          { id: 'RowPropagate', label: 'Propager (Fill Up/Down)', view: 'transformation', action: 'row-propagate', icon: 'row-propagate' },
          { id: 'RowIsolate', label: 'Isoler lignes suspectes', view: 'transformation', action: 'row-isolate', icon: 'row-isolate' },
        ],
      },
    ],
  },
  {
    id: 'GroupCombiner',
    label: 'Combiner',
    controls: [
      {
        type: 'button',
        id: 'BtnMerge',
        label: 'Fusionner',
        desc: 'Fusionner (Merge) des tables sur leurs clés communes.',
        view: 'combiner',
        action: 'merge',
        icon: 'merge',
      },
      {
        type: 'button',
        id: 'BtnAppend',
        label: 'Combiner',
        desc: 'Empiler (Append) des tables aux structures compatibles.',
        view: 'combiner',
        action: 'append',
        icon: 'append',
      },
    ],
  },
  {
    id: 'GroupAutomation',
    label: 'Automation',
    controls: [
      {
        type: 'button',
        id: 'BtnReapply',
        label: 'Réappliquer',
        desc: 'Rejouer la recette de nettoyage enregistrée sur les données actuelles.',
        view: 'automation',
        action: 'reapply',
        icon: 'reapply',
      },
      {
        type: 'button',
        id: 'BtnWatchFolder',
        label: 'Suivre Dossier',
        desc: 'Automatiser le nettoyage sur les nouveaux fichiers d\'un dossier.',
        view: 'automation',
        action: 'watch-folder',
        icon: 'watch-folder',
      },
    ],
  },
];

export function taskpaneUrl(base, view, action) {
  const q = new URLSearchParams({ view, action });
  return `${base}/taskpane.html?${q.toString()}`;
}
