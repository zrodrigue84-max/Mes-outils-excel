// src/taskpane.js

// --- 1. DÉTECTION DU MODULE ACTIF ---
function getModule() {
  const params = new URLSearchParams(window.location.search);
  return params.get('module') || 'finance';
}
const currentModule = getModule();

// --- 2. MISE À JOUR DES LIBELLÉS (pour le bouton de la barre) ---
function updateLabels() {
  const btnRun = document.getElementById('btnRun');
  if (currentModule === 'nettoyage') {
    btnRun.textContent = '🧹 Nettoyage IA';
  } else if (currentModule === 'avis') {
    btnRun.textContent = '📊 Analyser les avis';
  } else {
    btnRun.textContent = '📈 Analyse financière';
  }
}

// --- 3. SÉLECTION DE PLAGE AVEC ÉCOUTEUR D'ÉVÉNEMENT ---
function selectRange() {
  // Griser la zone des options
  const optionsZone = document.getElementById('options-zone');
  if (optionsZone) {
    optionsZone.classList.add('disabled-zone');
  }
  // Afficher le message d'attente
  const waitingMsg = document.getElementById('waiting-message');
  if (waitingMsg) {
    waitingMsg.style.display = 'block';
  }

  // Ajouter l'écouteur d'événement de changement de sélection
  Office.context.document.addHandlerAsync(
    Office.EventType.DocumentSelectionChanged,
    onSelectionMade,
    function (asyncResult) {
      if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
        console.error('Erreur lors de l\'ajout de l\'écouteur :', asyncResult.error.message);
        alert('Impossible de détecter la sélection. Veuillez réessayer.');
        // Réactiver la zone en cas d'erreur
        if (optionsZone) {
          optionsZone.classList.remove('disabled-zone');
        }
        if (waitingMsg) {
          waitingMsg.style.display = 'none';
        }
      }
    }
  );
}

// --- 4. FONCTION APPELÉE LORS DE LA SÉLECTION ---
function onSelectionMade(eventArgs) {
  Office.context.document.getSelectedDataAsync(
    Office.CoercionType.Matrix,
    function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const data = result.value;
        console.log('Données récupérées après sélection :', data);
        window.selectedData = data;
        showPreview(data);

        // Dégriser la zone des options
        const optionsZone = document.getElementById('options-zone');
        if (optionsZone) {
          optionsZone.classList.remove('disabled-zone');
        }
        // Cacher le message d'attente
        const waitingMsg = document.getElementById('waiting-message');
        if (waitingMsg) {
          waitingMsg.style.display = 'none';
        }

        // Retirer l'écouteur (on ne veut qu'une seule sélection)
        Office.context.document.removeHandlerAsync(
          Office.EventType.DocumentSelectionChanged,
          { handler: onSelectionMade },
          function (removeResult) {
            if (removeResult.status !== Office.AsyncResultStatus.Succeeded) {
              console.warn('Impossible de retirer l\'écouteur :', removeResult.error.message);
            }
          }
        );
      } else {
        console.error('Erreur lors de la lecture des données :', result.error.message);
        alert('Erreur : impossible de lire les données sélectionnées. Veuillez réessayer.');
        // Réactiver en cas d'erreur
        const optionsZone = document.getElementById('options-zone');
        if (optionsZone) {
          optionsZone.classList.remove('disabled-zone');
        }
        const waitingMsg = document.getElementById('waiting-message');
        if (waitingMsg) {
          waitingMsg.style.display = 'none';
        }
      }
    }
  );
}

// --- 5. APERÇU DES DONNÉES BRUTES ---
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

// --- 6. APERÇU DES DONNÉES NETTOYÉES ---
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

// --- 7. LANCER L'ANALYSE (APPEL AU BACKEND) ---
async function runAnalysis() {
  if (!window.selectedData || window.selectedData.length === 0) {
    alert('Veuillez d\'abord sélectionner une plage de données avec le bouton "Sélectionner la plage de données".');
    return;
  }

  const options = {
    removeDuplicates: document.getElementById('chkDuplicates')?.checked || false,
    fixFormats: document.getElementById('chkFormats')?.checked || false,
    handleMissing: document.getElementById('selectMissing')?.value || 'none'
  };

  // Afficher le chargement
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'block';

  try {
    const response = await fetch('/api/analyze/' + currentModule, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: window.selectedData,
        options: options
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur serveur (${response.status}) : ${errorText}`);
    }

    const result = await response.json();
    if (result.error) throw new Error(result.error);

    window.analysisResult = result;
    showResultsPhase(result);

  } catch (error) {
    console.error('Erreur analyse :', error);
    alert('Erreur lors de l\'analyse : ' + error.message);
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

// --- 8. AFFICHER LES RÉSULTATS ---
function showResultsPhase(result) {
  document.getElementById('config-phase').style.display = 'none';
  document.getElementById('results-phase').style.display = 'block';
  
  // Remplir l'onglet Résumé (exemple pour Nettoyage)
  const tabContent = document.getElementById('tab-content');
  if (tabContent) {
    tabContent.innerHTML = `
      <p><strong>Résumé du nettoyage :</strong></p>
      <ul>
        <li>Doublons supprimés : ${result.summary?.duplicatesRemoved || 0}</li>
        <li>Dates corrigées : ${result.summary?.datesFixed || 0}</li>
        <li>Cellules vides traitées : ${result.summary?.emptyCellsHandled || 0}</li>
        <li>Valeurs aberrantes détectées : ${result.summary?.outliersDetected || 0}</li>
      </ul>
      <p><strong>Aperçu des données nettoyées :</strong></p>
    `;
  }
  showCleanedPreview(result.cleanedData);
}

// --- 9. EXPORTER VERS UNE NOUVELLE FEUILLE AVEC TABLEAU STRUCTURÉ ---
async function exportToExcel() {
  if (!window.analysisResult) {
    alert('Aucun résultat à exporter.');
    return;
  }

  const dataToExport = window.analysisResult.cleanedData || window.analysisResult;
  if (!dataToExport || dataToExport.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

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

    // Créer la nouvelle feuille
    const newSheet = sheets.add(sheetName);
    
    // Écrire les données
    const range = newSheet.getRangeByIndexes(0, 0, dataToExport.length, dataToExport[0].length);
    range.values = dataToExport;
    range.format.autofitColumns();

    // ✅ Créer un tableau structuré (Excel Table) avec style
    const table = newSheet.tables.add(range, true); // true = en-têtes
    table.style = "TableStyleMedium9";

    await context.sync();
    alert(`Export terminé ! Feuille "${sheetName}" créée avec un tableau structuré.`);
  }).catch(error => {
    console.error('Erreur lors de l\'export:', error);
    alert('Une erreur est survenue lors de l\'export. Voir la console pour plus de détails.');
  });
}

// --- 10. INITIALISATION ---
Office.onReady(function(info) {
  if (info.host === Office.HostType.Excel) {
    updateLabels();

    // Bouton "Sélectionner la plage" (nouvelle logique)
    document.getElementById('btnSelectRange').onclick = selectRange;

    // Bouton "Nettoyage approfondi" (zone options)
    document.getElementById('btnDeepClean').onclick = function() {
      const chkDuplicates = document.getElementById('chkDuplicates');
      const chkFormats = document.getElementById('chkFormats');
      const selectMissing = document.getElementById('selectMissing');
      if (chkDuplicates) chkDuplicates.checked = true;
      if (chkFormats) chkFormats.checked = true;
      if (selectMissing) selectMissing.value = 'ai';
      // Lancer directement l'analyse
      runAnalysis();
    };

    // Bouton "Lancer le nettoyage" (zone options)
    document.getElementById('btnRunClean').onclick = runAnalysis;

    // Bouton de la barre (défilement)
    document.getElementById('btnRun').onclick = function() {
      const target = document.getElementById('btnSelectRange');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // Boutons d'export et nouvelle analyse
    document.getElementById('btnExport').onclick = exportToExcel;
    document.getElementById('btnNewAnalysis').onclick = function() {
      document.getElementById('results-phase').style.display = 'none';
      document.getElementById('config-phase').style.display = 'block';
      // Réinitialiser l'état
      window.selectedData = null;
      window.analysisResult = null;
      // Réactiver la zone d'options (grisée par défaut)
      const optionsZone = document.getElementById('options-zone');
      if (optionsZone) {
        optionsZone.classList.add('disabled-zone');
      }
      // Réinitialiser l'aperçu
      const previewDiv = document.getElementById('data-preview');
      if (previewDiv) {
        previewDiv.innerHTML = '<em style="color:#888;">Aucune plage sélectionnée pour l\'instant.</em>';
      }
      // Cacher le message d'attente
      const waitingMsg = document.getElementById('waiting-message');
      if (waitingMsg) {
        waitingMsg.style.display = 'none';
      }
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

    console.log('Suite IA Pro prêt - Module:', currentModule);
  }
});