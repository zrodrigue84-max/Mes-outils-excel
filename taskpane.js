/* ============================================================
   Suite IA Pro — taskpane.js
   Règle universelle : JAMAIS modifier les feuilles existantes.
   Chaque opération crée une NOUVELLE feuille dédiée.
   ============================================================ */

'use strict';

const MODULES = {
  finance: {
    id: 'finance',
    badge: 'Finance',
    title: 'Analyse Financière',
    subtitle: 'Ratios, indicateurs et rapports financiers IA',
    sheetPrefix: 'Rapport Financier IA',
    locked: true,
    actions: {
      ratios: {
        label: 'Calculer Ratios',
        desc: 'Calcule les ratios de liquidité, solvabilité et rentabilité.',
        steps: ['Lecture des données source', 'Calcul des ratios', 'Création feuille dédiée', 'Insertion des résultats'],
        sheetSuffix: 'Ratios',
      },
      report: {
        label: 'Générer Rapport Complet',
        desc: 'Produit un rapport financier complet avec graphiques et recommandations.',
        steps: ['Analyse des états financiers', 'Génération du rapport', 'Création feuille dédiée', 'Mise en forme'],
        sheetSuffix: 'Complet',
      },
    },
  },

  avis: {
    id: 'avis',
    badge: 'Avis Clients',
    title: 'Avis Clients',
    subtitle: 'Analyse de sentiments et rapports clients IA',
    sheetPrefix: 'Rapport Avis IA',
    locked: false,
    actions: {
      sentiments: {
        label: 'Analyser Sentiments',
        desc: 'Analyse le ton et les sentiments des avis clients.',
        steps: ['Collecte des avis', 'Analyse NLP des sentiments', 'Création feuille dédiée', 'Visualisation'],
        sheetSuffix: 'Sentiments',
      },
      report: {
        label: 'Générer Rapport Client',
        desc: 'Génère un rapport complet sur la satisfaction client.',
        steps: ['Agrégation des avis', 'Scoring satisfaction', 'Création feuille dédiée', 'Recommandations'],
        sheetSuffix: 'Complet',
      },
    },
  },

  stocks: {
    id: 'stocks',
    badge: 'Stocks',
    title: 'Gestion des Stocks',
    subtitle: 'Optimisation Wilson et niveaux de sécurité',
    sheetPrefix: 'Optimisation Stocks IA',
    locked: true,
    actions: {
      wilson: {
        label: 'Calculer Wilson',
        desc: 'Applique la formule de Wilson pour optimiser les stocks.',
        steps: ['Lecture des mouvements', 'Calcul Wilson', 'Création feuille dédiée', 'Recommandations stock'],
        sheetSuffix: 'Wilson',
      },
      security: {
        label: 'Niveau Sécurité',
        desc: 'Détermine les niveaux de stock de sécurité optimaux.',
        steps: ['Analyse des délais', 'Calcul niveau sécurité', 'Création feuille dédiée', 'Alertes'],
        sheetSuffix: 'Sécurité',
      },
    },
  },
};

let currentModule = null;
let currentAction = null;

Office.onReady((info) => {
  if (info.host !== Office.HostType.Excel) {
    document.body.innerHTML = '<p style="padding:20px">Ce complément fonctionne uniquement dans Excel.</p>';
    return;
  }
  initTaskpane();
});

function initTaskpane() {
  const params = new URLSearchParams(window.location.search);
  const moduleId = params.get('module') || 'avis';
  const actionId = params.get('action') || 'sentiments';

  currentModule = MODULES[moduleId] || MODULES.avis;
  currentAction = currentModule.actions[actionId] || Object.values(currentModule.actions)[0];

  renderUI();
  bindEvents();

  document.getElementById('app').classList.remove('hidden');
}

function renderUI() {
  document.getElementById('module-badge').textContent    = currentModule.badge;
  document.getElementById('module-title').textContent    = currentModule.title;
  document.getElementById('module-subtitle').textContent = currentModule.subtitle;
  document.getElementById('action-label').textContent    = currentAction.label;
  document.getElementById('action-desc').textContent     = currentAction.desc;

  const stepsList = document.getElementById('steps-list');
  stepsList.innerHTML = '';
  currentAction.steps.forEach((step, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="step-dot"></span>${step}`;
    if (i === 0) li.classList.add('active');
    li.dataset.index = i;
    stepsList.appendChild(li);
  });

  const isLocked = currentModule.locked;
  document.getElementById('lock-panel').classList.toggle('hidden', !isLocked);
  document.getElementById('action-panel').classList.toggle('hidden', isLocked);
  document.getElementById('btn-generate').disabled = isLocked;

  if (isLocked) {
    document.getElementById('lock-message').textContent =
      `Le module « ${currentModule.title} » nécessite un abonnement Pro actif. ` +
      `Seul « Avis Clients » est disponible dans votre formule actuelle.`;
  }
}

function bindEvents() {
  document.getElementById('btn-generate').addEventListener('click', handleGenerate);
  document.getElementById('btn-upgrade').addEventListener('click', () => {
    setStatus('Redirection vers la page d\'abonnement…', 'info');
  });
}

function isModuleUnlocked(moduleId) {
  return MODULES[moduleId] && !MODULES[moduleId].locked;
}

/**
 * Crée une NOUVELLE feuille dans le classeur sans jamais
 * modifier les feuilles existantes de l'utilisateur.
 *
 * @param {string} sheetPrefix - Préfixe du nom (ex: "Rapport Financier IA")
 * @param {string} [suffix]    - Suffixe optionnel (ex: "Ratios")
 * @returns {Promise<{name: string, sheet: Excel.Worksheet}>}
 */
async function createDedicatedSheet(sheetPrefix, suffix = '') {
  return Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;

    sheets.load('items/name');
    await context.sync();

    const existingNames = new Set(sheets.items.map(s => s.name));
    const timestamp = new Date().toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).replace(/[/:]/g, '-').replace(', ', '_');

    const baseName = suffix ? `${sheetPrefix} — ${suffix}` : sheetPrefix;

    let candidate = `${baseName} (${timestamp})`;
    let counter = 1;

    while (existingNames.has(candidate)) {
      candidate = `${baseName} (${timestamp}) #${counter++}`;
    }

    const newSheet = sheets.add(candidate);
    newSheet.activate();

    const headerRange = newSheet.getRange('A1:D1');
    headerRange.values = [[`${baseName}`, 'Généré par Suite IA Pro', timestamp, '']];
    headerRange.format.fill.color = '#0d1b3e';
    headerRange.format.font.color = '#ffffff';
    headerRange.format.font.bold = true;

    await context.sync();

    return { name: candidate, sheet: newSheet };
  });
}

async function handleGenerate() {
  if (!isModuleUnlocked(currentModule.id)) return;

  const btn = document.getElementById('btn-generate');
  btn.disabled = true;
  setStatus('Initialisation…');

  try {
    await animateSteps(async (stepIndex) => {
      switch (stepIndex) {
        case 0:
          setStatus('Lecture des données source (feuilles existantes intactes)…');
          await delay(400);
          break;
        case 1:
          setStatus(`Calcul en cours : ${currentAction.label}…`);
          await delay(600);
          break;
        case 2: {
          setStatus('Création de la nouvelle feuille dédiée…');
          const { name } = await createDedicatedSheet(
            currentModule.sheetPrefix,
            currentAction.sheetSuffix
          );
          window._lastSheetName = name;
          break;
        }
        case 3:
          setStatus('Insertion des résultats dans la nouvelle feuille…');
          await insertPlaceholderResults(window._lastSheetName);
          break;
      }
    });

    setStatus(
      `✓ Rapport généré dans la feuille « ${window._lastSheetName} ». Vos données originales sont intactes.`,
      'success'
    );
  } catch (err) {
    console.error(err);
    setStatus(`Erreur : ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
}

async function insertPlaceholderResults(sheetName) {
  return Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getItem(sheetName);

    const data = [
      ['Indicateur', 'Valeur', 'Statut', 'Recommandation'],
      ['Exemple KPI 1', '—', 'En attente', 'À compléter'],
      ['Exemple KPI 2', '—', 'En attente', 'À compléter'],
      ['Exemple KPI 3', '—', 'En attente', 'À compléter'],
    ];

    const range = sheet.getRange('A3:D6');
    range.values = data;
    range.format.autofitColumns();

    await context.sync();
  });
}

async function animateSteps(stepCallback) {
  const steps = document.querySelectorAll('#steps-list li');
  const fill = document.getElementById('progress-fill');

  for (let i = 0; i < steps.length; i++) {
    steps.forEach((s, j) => {
      s.classList.toggle('active', j === i);
      s.classList.toggle('done', j < i);
    });
    fill.style.width = `${((i + 1) / steps.length) * 100}%`;
    await stepCallback(i);
  }

  steps.forEach(s => {
    s.classList.remove('active');
    s.classList.add('done');
  });
}

function setStatus(msg, type = 'info') {
  const el = document.getElementById('status-message');
  el.textContent = msg;
  el.className = 'status-message' + (type !== 'info' ? ` ${type}` : '');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.SuiteIAPro = { createDedicatedSheet, MODULES, isModuleUnlocked };
