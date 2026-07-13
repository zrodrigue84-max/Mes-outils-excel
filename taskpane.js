// src/taskpane.js

// --- 1. DÉTECTION DU MODULE ACTIF ---
function getModule() {
  const params = new URLSearchParams(window.location.search);
  return params.get('module') || 'finance';
}
const currentModule = getModule();

// --- 2. RÉFÉRENCE À L'ÉCOUTEUR DE SÉLECTION ---
let selectionHandler = null;

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
  Office.context.document.getSelectedDataAsync(
    Office.CoercionType.Matrix,
    async function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const data = result.value;
        window.selectedData = data;
        
        const rangeInfo = await getRangeInfo();
        const rangeInfoDiv = document.getElementById('range-info');
        if (rangeInfoDiv && rangeInfo.address) {
          rangeInfoDiv.innerHTML = `✅ Plage sélectionnée : ${rangeInfo.address} (${rangeInfo.rowCount} lignes × ${rangeInfo.colCount} colonnes)`;
        } else if (rangeInfoDiv) {
          rangeInfoDiv.innerHTML = `✅ Plage sélectionnée : ${data.length} lignes × ${data[0]?.length || 0} colonnes`;
        }

        showPreview(data);
        
        const optionsZone = document.getElementById('options-zone');
        if (optionsZone) {
          optionsZone.classList.remove('disabled-zone');
        }
        document.getElementById('waiting-message').style.display = 'none';
        
        // L'écouteur reste actif
      } else {
        console.error('Erreur sélection:', result.error.message);
      }
    }
  );
}

// --- 8. BOUTON "SÉLECTIONNER LA PLAGE" ---
function selectRange() {
  const optionsZone = document.getElementById('options-zone');
  if (optionsZone) {
    optionsZone.classList.add('disabled-zone');
  }
  document.getElementById('waiting-message').style.display = 'block';
  
  if (selectionHandler) {
    Office.context.document.removeHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      { handler: selectionHandler }
    );
  }
  
  selectionHandler = onSelectionMade;
  Office.context.document.addHandlerAsync(
    Office.EventType.DocumentSelectionChanged,
    onSelectionMade
  );
  
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

  // Retirer l'écouteur pour figer la sélection
  if (selectionHandler) {
    Office.context.document.removeHandlerAsync(
      Office.EventType.DocumentSelectionChanged,
      { handler: selectionHandler }
    );
    selectionHandler = null;
  }

  const options = {
    handleMissing: document.getElementById('selectMissing')?.value || 'ignore'
  };

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
    loading.classList.remove('active');
  }
}

// --- 10. AFFICHER LES RÉSULTATS (résumé enrichi) ---
function showResultsPhase(result) {
  document.getElementById('config-phase').style.display = 'none';
  document.getElementById('results-phase').style.display = 'block';
  
  document.getElementById('tab-content').innerHTML = `
    <p><strong>Résumé du nettoyage :</strong></p>
    <ul>
      <li>Doublons supprimés : ${result.summary?.duplicatesRemoved || 0}</li>
      <li>Noms reformatés : ${result.summary?.namesFormatted || 0}</li>
      <li>Dates corrigées : ${result.summary?.datesFixed || 0}</li>
      <li>Téléphones corrigés : ${result.summary?.phonesFixed || 0}</li>
      <li>Emails corrigés : ${result.summary?.emailsFixed || 0}</li>
      <li>Montants formatés : ${result.summary?.amountsFormatted || 0}</li>
      <li>Pourcentages formatés : ${result.summary?.percentagesFormatted || 0}</li>
      <li>En-têtes renommés : ${result.summary?.headersRenamed || 0}</li>
      <li>Cellules vides traitées : ${result.summary?.emptyCellsHandled || 0}</li>
      <li>Valeurs aberrantes détectées : ${result.summary?.outliersDetected || 0}</li>
    </ul>
    <p><strong>Aperçu des données nettoyées :</strong></p>
  `;
  showCleanedPreview(result.cleanedData);
}

// --- 11. EXPORTER VERS UNE NOUVELLE FEUILLE (avec vérification de cohérence) ---
async function exportToExcel() {
  if (!window.analysisResult) {
    alert('Aucun résultat à exporter.');
    return;
  }

  const dataToExport = window.analysisResult.cleanedData || window.analysisResult;
  const columnTypes = window.analysisResult.columnTypes || [];

  await Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    let baseName = `Analyse_${currentModule}_${new Date().toISOString().slice(0,10)}`;
    let sheetName = baseName;
    let counter = 1;

    while (true) {
      const existing = sheets.getItemOrNullObject(sheetName);
      await context.sync();
      if (existing.isNullObject) break;
      counter++;
      sheetName = `${baseName}_${counter}`;
    }

    const newSheet = sheets.add(sheetName);
    const range = newSheet.getRangeByIndexes(0, 0, dataToExport.length, dataToExport[0].length);
    range.values = dataToExport;
    range.format.autofitColumns();

    // Création d'un tableau structuré
    const table = newSheet.tables.add(range, true);
    table.style = "TableStyleMedium9";

    // ✅ Sécurisation du formatage : on vérifie que columnTypes est cohérent
    const numberOfDataRows = dataToExport.length - 1;
    if (numberOfDataRows > 0 && columnTypes.length === dataToExport[0].length) {
      columnTypes.forEach((type, colIndex) => {
        const columnRange = newSheet.getRangeByIndexes(1, colIndex, numberOfDataRows, 1);
        let formatString = null;
        if (type === 'date') formatString = 'jj/mm/aaaa';
        else if (type === 'montant') formatString = '#,##0.00 €';
        else if (type === 'pourcentage') formatString = '0.00%';
        else if (type === 'nombre') formatString = '#,##0.00';
        if (formatString) {
          const formatArray = Array(numberOfDataRows).fill([formatString]);
          columnRange.numberFormat = formatArray;
        }
      });
    } else if (columnTypes.length !== dataToExport[0].length) {
      console.warn('columnTypes manquant ou incohérent, mise en forme ignorée.');
    }

    await context.sync();
    alert(`Export terminé ! Feuille "${sheetName}" créée avec un tableau structuré et formats adaptés.`);
  }).catch(error => {
    console.error('Erreur lors de l\'export:', error);
    alert('Une erreur est survenue lors de l\'export. Voir la console pour plus de détails.');
  });
}

// --- 12. INITIALISATION ---
Office.onReady(function(info) {
  if (info.host === Office.HostType.Excel) {
    updateLabels();

    document.getElementById('btnRun').onclick = function() {
      document.getElementById('btnSelectRange').scrollIntoView({ 
        behavior: 'smooth', block: 'center' 
      });
    };

    document.getElementById('btnSelectRange').onclick = selectRange;
    document.getElementById('btnRunClean').onclick = runAnalysis;
    document.getElementById('btnExport').onclick = exportToExcel;
    document.getElementById('btnNewAnalysis').onclick = function() {
      document.getElementById('results-phase').style.display = 'none';
      document.getElementById('config-phase').style.display = 'block';
      window.selectedData = null;
      window.analysisResult = null;
      
      if (selectionHandler) {
        Office.context.document.removeHandlerAsync(
          Office.EventType.DocumentSelectionChanged,
          { handler: selectionHandler }
        );
        selectionHandler = null;
      }
      
      const optionsZone = document.getElementById('options-zone');
      if (optionsZone) {
        optionsZone.classList.add('disabled-zone');
      }
      document.getElementById('waiting-message').style.display = 'block';
      document.getElementById('range-info').innerHTML = '';
      document.getElementById('data-preview').innerHTML = '<em style="color:#888;">Aucune plage sélectionnée pour l\'instant.</em>';
    };

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

    document.getElementById('options-zone').classList.add('disabled-zone');
    document.getElementById('waiting-message').style.display = 'block';
  }
});