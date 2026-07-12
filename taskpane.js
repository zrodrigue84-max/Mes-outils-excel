// src/taskpane.js

// --- 1. DÉTECTION DU MODULE ACTIF ---
function getModule() {
  const params = new URLSearchParams(window.location.search);
  return params.get('module') || 'finance';
}
const currentModule = getModule();

// --- 2. RÉFÉRENCE À L'ÉCOUTEUR DE SÉLECTION ---
let selectionHandler = null; // Pour pouvoir le retirer plus tard

// --- 3. MISE À JOUR DES LIBELLÉS ---
function updateLabels() {
  if (currentModule === 'nettoyage') {
    document.getElementById('btnRun').textContent = '🧹 Lancer le nettoyage IA';
  } else if (currentModule === 'avis') {
    document.getElementById('btnRun').textContent = '📊 Analyser les avis';
  } else {
    document.getElementById('btnRun').textContent = '📈 Lancer l\'analyse financière';
  }
}

// --- 4. RÉCUPÉRER LES INFOS DE LA PLAGE (adresse, dimensions) ---
async function getRangeInfo() {
  let info = { address: '', rowCount: 0, colCount: 0 };
  try {
    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.load('address, rowCount, columnCount');
      await context.sync();
      info.address = range.address;
      info.rowCount = range.rowCount;
      info.colCount = range.columnCount;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des infos de plage:', error);
  }
  return info;
}

// --- 5. AFFICHER L'APERÇU DES DONNÉES BRUTES ---
function showPreview(data) {
  const previewDiv = document.getElementById('data-preview');
  if (!previewDiv) return;
  
  if (!data || data.length === 0) {
    previewDiv.innerHTML = '<p>Aucune donnée sélectionnée.</p>';
    return;
  }

  const rows = data.slice(0, 6);
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

// --- 6. AFFICHER L'APERÇU DES DONNÉES NETTOYÉES ---
function showCleanedPreview(cleanedData) {
  const previewDiv = document.getElementById('cleaned-preview');
  if (!previewDiv) return;
  
  if (!cleanedData || cleanedData.length === 0) {
    previewDiv.innerHTML = '<p>Aucune donnée nettoyée à afficher.</p>';
    return;
  }

  const rows = cleanedData.slice(0, 6);
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

// --- 7. FONCTION APPELÉE LORS DE LA SÉLECTION (écouteur continu) ---
async function onSelectionMade(eventArgs) {
  // Récupérer les données
  Office.context.document.getSelectedDataAsync(
    Office.CoercionType.Matrix,
    async function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const data = result.value;
        window.selectedData = data;
        
        // Récupérer les infos de la plage (adresse, dimensions)
        const rangeInfo = await getRangeInfo();
        const rangeInfoDiv = document.getElementById('range-info');
        if (rangeInfoDiv && rangeInfo.address) {
          rangeInfoDiv.innerHTML = `✅ Plage sélectionnée : ${rangeInfo.address} (${rangeInfo.rowCount} lignes × ${rangeInfo.colCount} colonnes)`;
        } else if (rangeInfoDiv) {
          rangeInfoDiv.innerHTML = `✅ Plage sélectionnée : ${data.length} lignes × ${data[0]?.length || 0} colonnes`;
        }

        showPreview(data);
        
        // Dégriser la zone des options
        const optionsZone = document.getElementById('options-zone');
        if (optionsZone) {
          optionsZone.classList.remove('disabled-zone');
        }
        document.getElementById('waiting-message').style.display = 'none';
        
        // 🔴 NE PAS retirer l'écouteur ici — il reste actif en continu
        // L'utilisateur peut sélectionner une nouvelle plage à tout moment
      } else {
        console.error('Erreur sélection:', result.error.message);
      }
    }
  );
}

// --- 8. BOUTON "SÉLECTIONNER LA PLAGE" (active l'écouteur) ---
function selectRange() {
  // Désactiver les options en attendant la sélection
  const optionsZone = document.getElementById('options-zone');
  if (optionsZone) {
    optionsZone.classList.add('disabled-zone');
  }
  document.getElementById('waiting-message').style.display = 'block';
  
  // Supprimer l'ancien écouteur s'il existe
  if (selectionHandler) {
    Office.context.document.removeHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      { handler: selectionHandler }
    );
  }
  
  // Ajouter le nouvel écouteur
  selectionHandler = onSelectionMade;
  Office.context.document.addHandlerAsync(
    Office.EventType.DocumentSelectionChanged,
    onSelectionMade
  );
  
  // Afficher un message d'instruction
  const rangeInfoDiv = document.getElementById('range-info');
  if (rangeInfoDiv) {
    rangeInfoDiv.innerHTML = '⏳ Sélectionnez une plage dans votre feuille Excel...';
  }
}

// --- 9. LANCER L'ANALYSE (APPEL AU BACKEND) ---
async function runAnalysis() {
  if (!window.selectedData || window.selectedData.length === 0) {
    alert('Veuillez d\'abord sélectionner une plage de données.');
    return;
  }

  // 🔴 Retirer l'écouteur pour figer la sélection pendant le traitement
  if (selectionHandler) {
    Office.context.document.removeHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      { handler: selectionHandler }
    );
    selectionHandler = null;
  }

  const options = {
    removeDuplicates: document.getElementById('chkDuplicates')?.checked || false,
    fixFormats: document.getElementById('chkFormats')?.checked || false,
    handleMissing: document.getElementById('selectMissing')?.value || 'none'
  };

  // Afficher l'overlay de chargement
  const loading = document.getElementById('loading');
  loading.classList.add('active');

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
    // Cacher l'overlay de chargement
    loading.classList.remove('active');
  }
}

// --- 10. AFFICHER LES RÉSULTATS ---
function showResultsPhase(result) {
  document.getElementById('config-phase').style.display = 'none';
  document.getElementById('results-phase').style.display = 'block';
  
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
  showCleanedPreview(result.cleanedData);
}

// --- 11. EXPORTER VERS UNE NOUVELLE FEUILLE (avec Tableau structuré) ---
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

    // Gestion des collisions
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

    // ✅ Création d'un Tableau Excel structuré
    const table = newSheet.tables.add(range, true);
    table.style = "TableStyleMedium9";

    await context.sync();
    alert(`Export terminé ! Feuille "${sheetName}" créée avec un tableau structuré.`);
  }).catch(error => {
    console.error('Erreur lors de l\'export:', error);
    alert('Une erreur est survenue lors de l\'export. Voir la console pour plus de détails.');
  });
}

// --- 12. BOUTON "NETTOYAGE APPROFONDI" (coche les options + lance) ---
function runDeepClean() {
  const chkDuplicates = document.getElementById('chkDuplicates');
  const chkFormats = document.getElementById('chkFormats');
  const selectMissing = document.getElementById('selectMissing');
  
  if (chkDuplicates) chkDuplicates.checked = true;
  if (chkFormats) chkFormats.checked = true;
  if (selectMissing) selectMissing.value = 'ai';
  
  runAnalysis();
}

// --- 13. INITIALISATION ---
Office.onReady(function(info) {
  if (info.host === Office.HostType.Excel) {
    updateLabels();

    // Bouton du haut (#btnRun) → scroll jusqu'à #btnSelectRange
    document.getElementById('btnRun').onclick = function() {
      document.getElementById('btnSelectRange').scrollIntoView({ 
        behavior: 'smooth', block: 'center' 
      });
    };

    // Boutons de la barre
    document.getElementById('btnSelectRange').onclick = selectRange;
    document.getElementById('btnExport').onclick = exportToExcel;
    document.getElementById('btnNewAnalysis').onclick = function() {
      document.getElementById('results-phase').style.display = 'none';
      document.getElementById('config-phase').style.display = 'block';
      window.selectedData = null;
      window.analysisResult = null;
      
      // 🔴 Retirer l'écouteur pour repartir proprement
      if (selectionHandler) {
        Office.context.document.removeHandlerAsync(
          Office.EventType.DocumentSelectionChanged,
          { handler: selectionHandler }
        );
        selectionHandler = null;
      }
      
      // Réactiver la zone d'options (grisée par défaut)
      const optionsZone = document.getElementById('options-zone');
      if (optionsZone) {
        optionsZone.classList.add('disabled-zone');
      }
      document.getElementById('waiting-message').style.display = 'block';
      document.getElementById('range-info').innerHTML = '';
      document.getElementById('data-preview').innerHTML = '<em style="color:#888;">Aucune plage sélectionnée pour l\'instant.</em>';
    };

    // Boutons "Nettoyage approfondi" et "Lancer le nettoyage" (dans options-zone)
    document.getElementById('btnDeepClean').onclick = runDeepClean;
    document.getElementById('btnRunClean').onclick = runAnalysis;

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

    // Par défaut, la zone options-zone est grisée tant qu'aucune plage n'est sélectionnée
    document.getElementById('options-zone').classList.add('disabled-zone');
    document.getElementById('waiting-message').style.display = 'block';
  }
});