// src/taskpane.js

// --- 1. DÉTECTION DU MODULE ACTIF ---
function getModule() {
  const params = new URLSearchParams(window.location.search);
  return params.get('module') || 'finance'; // fallback
}
const currentModule = getModule();

// --- 2. MISE À JOUR DES LIBELLÉS ---
function updateLabels() {
  if (currentModule === 'nettoyage') {
    document.getElementById('btnRun').textContent = '🧹 Lancer le nettoyage IA';
  } else if (currentModule === 'avis') {
    document.getElementById('btnRun').textContent = '📊 Analyser les avis';
  } else {
    document.getElementById('btnRun').textContent = '📈 Lancer l\'analyse financière';
  }
}

// --- 3. SÉLECTIONNER UNE PLAGE DANS EXCEL ---
function selectRange() {
  Office.context.document.getSelectedDataAsync(
    Office.CoercionType.Matrix,
    { asyncContext: { message: 'Données sélectionnées' } },
    function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const data = result.value; // Tableau 2D
        console.log('Données récupérées:', data);
        showPreview(data);
        window.selectedData = data;
      } else {
        console.error('Erreur sélection:', result.error.message);
        alert('Veuillez sélectionner une plage de cellules avant de continuer.');
      }
    }
  );
}

// --- 4. APERÇU DES DONNÉES BRUTES (phase Configuration) ---
function showPreview(data) {
  const previewDiv = document.getElementById('data-preview');
  if (!previewDiv) return;
  
  if (!data || data.length === 0) {
    previewDiv.innerHTML = '<p>Aucune donnée sélectionnée.</p>';
    return;
  }

  const rows = data.slice(0, 6); // 5 premières lignes + en-tête
  let html = '<table border="1" style="font-size:12px; width:100%; border-collapse:collapse;">';
  rows.forEach((row, index) => {
    html += `<tr style="${index === 0 ? 'background-color:#f0f0f0; font-weight:bold;' : ''}">`;
    row.forEach(cell => {
      html += `<td style="padding:4px; border:1px solid #ccc;">${cell !== undefined && cell !== null ? cell : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  previewDiv.innerHTML = html;
}

// --- 4bis. APERÇU DES DONNÉES NETTOYÉES (phase Résultats) ---
function showCleanedPreview(cleanedData) {
  const previewDiv = document.getElementById('cleaned-preview');
  if (!previewDiv) return;
  
  if (!cleanedData || cleanedData.length === 0) {
    previewDiv.innerHTML = '<p>Aucune donnée nettoyée à afficher.</p>';
    return;
  }

  const rows = cleanedData.slice(0, 6); // 5 premières lignes + en-tête
  let html = '<table border="1" style="font-size:12px; width:100%; border-collapse:collapse;">';
  rows.forEach((row, index) => {
    html += `<tr style="${index === 0 ? 'background-color:#e8f5e9; font-weight:bold;' : ''}">`;
    row.forEach(cell => {
      html += `<td style="padding:4px; border:1px solid #ccc;">${cell !== undefined && cell !== null ? cell : ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  previewDiv.innerHTML = html;
}

// --- 5. LANCER L'ANALYSE (APPEL AU BACKEND) ---
async function runAnalysis() {
  if (!window.selectedData || window.selectedData.length === 0) {
    alert('Veuillez d\'abord sélectionner une plage de données avec le bouton "Sélectionner".');
    return;
  }

  const options = {
    removeDuplicates: document.getElementById('chkDuplicates')?.checked || false,
    fixFormats: document.getElementById('chkFormats')?.checked || false,
    handleMissing: document.getElementById('selectMissing')?.value || 'none'
  };

  document.getElementById('loading').style.display = 'block';

  try {
    const response = await fetch('/api/analyze/' + currentModule, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: window.selectedData,
        options: options
      })
    });

    const result = await response.json();

    if (result.error) throw new Error(result.error);

    window.analysisResult = result;
    showResultsPhase(result);

  } catch (error) {
    alert('Erreur lors de l\'analyse : ' + error.message);
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

// --- 6. AFFICHER LES RÉSULTATS ---
function showResultsPhase(result) {
  document.getElementById('config-phase').style.display = 'none';
  document.getElementById('results-phase').style.display = 'block';
  
  // Remplir l'onglet Résumé (exemple pour Nettoyage)
  document.getElementById('tab-content').innerHTML = `
    <p><strong>Résumé du nettoyage :</strong></p>
    <ul>
      <li>Doublons supprimés : ${result.summary?.duplicatesRemoved || 0}</li>
      <li>Dates corrigées : ${result.summary?.datesFixed || 0}</li>
      <li>Cellules vides traitées : ${result.summary?.emptyCellsHandled || 0}</li>
      <li>Valeurs aberrantes détectées : ${result.summary?.outliersDetected || 0}</li>
    </ul>
    <p><strong>Aperçu des données nettoyées :</strong></p>
  `;
  // Appel à la fonction maintenant définie
  showCleanedPreview(result.cleanedData);
}

// --- 7. EXPORTER VERS UNE NOUVELLE FEUILLE (avec gestion robuste des collisions) ---
async function exportToExcel() {
  if (!window.analysisResult) {
    alert('Aucun résultat à exporter.');
    return;
  }

  const dataToExport = window.analysisResult.cleanedData || window.analysisResult;

  await Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    let baseName = `Analyse_${currentModule}_${new Date().toISOString().slice(0,10)}`;
    let sheetName = baseName;
    let counter = 1;

    // ✅ Gestion des collisions avec getItemOrNullObject()
    while (true) {
      const existing = sheets.getItemOrNullObject(sheetName);
      await context.sync();

      if (existing.isNullObject) {
        break;
      } else {
        counter++;
        sheetName = `${baseName}_${counter}`;
      }
    }

    const newSheet = sheets.add(sheetName);
    const range = newSheet.getRangeByIndexes(0, 0, dataToExport.length, dataToExport[0].length);
    range.values = dataToExport;
    range.format.autofitColumns();

    await context.sync();
    alert(`Export terminé ! Feuille "${sheetName}" créée.`);
  }).catch(error => {
    console.error('Erreur lors de l\'export:', error);
    alert('Une erreur est survenue lors de l\'export. Voir la console pour plus de détails.');
  });
}

// --- 8. INITIALISATION ---
Office.onReady(function(info) {
  if (info.host === Office.HostType.Excel) {
    updateLabels();

    // Bind des boutons
    document.getElementById('btnSelectRange').onclick = selectRange;
    document.getElementById('btnRun').onclick = runAnalysis;
    document.getElementById('btnExport').onclick = exportToExcel;
    document.getElementById('btnNewAnalysis').onclick = function() {
      document.getElementById('results-phase').style.display = 'none';
      document.getElementById('config-phase').style.display = 'block';
      window.selectedData = null;
      window.analysisResult = null;
    };

    // Placeholders pour les autres boutons de la barre
    document.getElementById('btnTemplate').onclick = function() {
      alert('Fonctionnalité "Télécharger modèle" à implémenter.');
    };
    document.getElementById('btnHowTo').onclick = function() {
      alert('Guide "Comment ça marche" à implémenter.');
    };
    document.getElementById('btnPrivacy').onclick = function() {
      alert('Politique de confidentialité : vos données transitent par l\'API Scaleway (GLM-5.2). Elles ne sont pas conservées après le traitement.');
    };
    document.getElementById('btnFeedback').onclick = function() {
      alert('Envoyez vos retours à support@suiteiapro.fr (ou ouvrez votre client mail).');
    };
  }
});