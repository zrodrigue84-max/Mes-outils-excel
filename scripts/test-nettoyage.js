/**
 * Script de test terminal — simule un appel du taskpane vers le backend nettoyage.
 *
 * Usage :
 *   npm run test:backend              → test complet (nécessite SCALEWAY_API_KEY)
 *   npm run test:backend -- --dry-run → vérifie uniquement la structure des données
 *
 * Variable d'environnement : SCALEWAY_API_KEY (identique à celle configurée sur Vercel)
 */

import { dirtyTestData, testOptions } from './test-data.js';

const DRY_RUN = process.argv.includes('--dry-run');
const API_URL = process.env.TEST_API_URL || 'http://localhost:3000/api/analyze/nettoyage';

function validateTestData(data) {
  const errors = [];

  if (!Array.isArray(data) || data.length < 2) {
    errors.push('Les données doivent contenir au moins une ligne d\'en-tête et une ligne de données.');
  }

  const headerCols = data[0]?.length ?? 0;
  if (headerCols === 0) {
    errors.push('La ligne d\'en-tête est vide.');
  }

  const hasDuplicates = data.slice(1).some((row, i, arr) =>
    arr.findIndex((r) => JSON.stringify(r) === JSON.stringify(row)) !== i
  );
  if (!hasDuplicates) {
    console.warn('⚠️  Avertissement : aucun doublon évident détecté dans les données de test.');
  }

  const dirtySignals = {
    mixedCase: data.some((row) => row.some((c) => typeof c === 'string' && c !== c.toLowerCase() && c !== c.toUpperCase())),
    extraSpaces: JSON.stringify(data).includes('  '),
    mixedDates: data.flat().some((c) => typeof c === 'string' && /\d{4}-\d{2}-\d{2}|janvier|\/\d{2}\/\d{4}/.test(c)),
  };

  console.log('📋 Validation des données de test :');
  console.log(`   Lignes : ${data.length} (${data.length - 1} données + en-tête)`);
  console.log(`   Colonnes : ${headerCols}`);
  console.log(`   Signaux « sales » : casse mixte=${dirtySignals.mixedCase}, espaces=${dirtySignals.extraSpaces}, dates mixtes=${dirtySignals.mixedDates}`);

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  console.log('✅ Structure des données de test OK\n');
}

function createMockResponse() {
  let statusCode = 200;
  let body = null;

  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      body = data;
      return this;
    },
    getResult() {
      return { statusCode, body };
    },
  };
}

async function testHandlerDirectly() {
  const { default: handler } = await import('../api/analyze/nettoyage.js');
  const req = {
    method: 'POST',
    body: { data: dirtyTestData, options: testOptions },
  };
  const res = createMockResponse();

  console.log('🔌 Appel direct du handler api/analyze/nettoyage.js...\n');
  await handler(req, res);

  const { statusCode, body } = res.getResult();

  if (statusCode !== 200) {
    throw new Error(`Handler a renvoyé ${statusCode} : ${JSON.stringify(body)}`);
  }

  validateResponse(body);
  return body;
}

async function testViaFetch() {
  console.log(`🌐 Appel HTTP POST ${API_URL}...\n`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: dirtyTestData, options: testOptions }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} : ${JSON.stringify(body)}`);
  }

  validateResponse(body);
  return body;
}

function validateResponse(result) {
  const required = ['cleanedData', 'columnTypes', 'summary'];
  for (const key of required) {
    if (!(key in result)) {
      throw new Error(`Réponse invalide : champ « ${key} » manquant.`);
    }
  }

  if (!Array.isArray(result.cleanedData) || result.cleanedData.length === 0) {
    throw new Error('cleanedData est vide ou absent.');
  }

  if (result.columnTypes.length !== result.cleanedData[0].length) {
    throw new Error(
      `columnTypes (${result.columnTypes.length}) ne correspond pas au nombre de colonnes (${result.cleanedData[0].length}).`
    );
  }

  console.log('📊 Résumé du nettoyage :');
  console.log(JSON.stringify(result.summary, null, 2));
  console.log(`\n✅ Réponse backend valide (${result.cleanedData.length} lignes nettoyées)\n`);
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Smart Cleaner AI — Test backend nettoyage');
  console.log('═══════════════════════════════════════════\n');

  validateTestData(dirtyTestData);

  if (DRY_RUN) {
    console.log('🏁 Mode --dry-run : test de structure terminé avec succès.\n');
    process.exit(0);
  }

  if (!process.env.SCALEWAY_API_KEY) {
    console.log('ℹ️  SCALEWAY_API_KEY non définie — tentative via fetch local (vercel dev)...\n');
    try {
      await testViaFetch();
    } catch (fetchErr) {
      console.error('❌ Échec fetch :', fetchErr.message);
      console.log('\n💡 Pour un test complet en local, définissez SCALEWAY_API_KEY puis relancez :');
      console.log('   set SCALEWAY_API_KEY=votre_cle && npm run test:backend\n');
      process.exit(1);
    }
  } else {
    await testHandlerDirectly();
  }

  console.log('🏁 Test backend terminé avec succès.\n');
}

main().catch((err) => {
  console.error('❌ Échec du test :', err.message);
  process.exit(1);
});
