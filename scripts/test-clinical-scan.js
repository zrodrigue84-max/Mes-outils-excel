/**
 * Test terminal du scan clinique local (Phase 2) — sans Excel, sans IA, sans clé API.
 */
import { dirtyTestData } from './test-data.js';
import {
  runClinicalScan,
  removeEmptyRows,
  fillEmptyCellsWithZero,
  propagateEmptyCellsDown,
  unifyAllDateColumns,
  parseToStandardDate,
} from './clinical-scan-core.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

console.log('\n=== Test scan clinique local (Phase 2) ===\n');

const scan = runClinicalScan(dirtyTestData);

console.log('1. Détection zone');
assert(scan.rowCount === 8, `8 lignes (1 en-tête + 7 données) — obtenu ${scan.rowCount}`);
assert(scan.columnCount === 5, `5 colonnes — obtenu ${scan.columnCount}`);
assert(scan.header[0] === 'nom_client', 'En-tête colonne 1 = nom_client');

console.log('\n2. Lignes vides');
assert(scan.emptyRowCount === 1, `1 ligne vide — obtenu ${scan.emptyRowCount}`);
assert(scan.emptyRowIndices[0] === 4, `Ligne vide à l'index 4 — obtenu ${scan.emptyRowIndices[0]}`);

const afterRemove = removeEmptyRows(dirtyTestData);
assert(afterRemove.length === 7, `Après suppression : 7 lignes — obtenu ${afterRemove.length}`);

console.log('\n3. Cellules vides');
assert(scan.emptyCellCount >= 3, `Au moins 3 cellules vides — obtenu ${scan.emptyCellCount}`);

const afterFill = fillEmptyCellsWithZero(dirtyTestData);
assert(afterFill[5][0] === 0, 'Cellule vide remplie par 0');
assert(afterFill[5][2] === 0, 'Deuxième cellule vide remplie par 0');

console.log('\n4. Formats de date');
assert(scan.dateColumns.length >= 1, `Au moins 1 colonne date — obtenu ${scan.dateColumns.length}`);
assert(scan.hasMixedDateFormats, 'Formats de date mixtes détectés');

const dateCol = scan.dateColumns.find((c) => c.header === 'date_inscription');
assert(!!dateCol, 'Colonne date_inscription détectée');
if (dateCol) {
  const formatIds = dateCol.formats.map((f) => f.format);
  assert(formatIds.includes('iso'), 'Format ISO détecté (2024-01-15)');
  assert(formatIds.includes('fr-slash'), 'Format JJ/MM/AAAA détecté');
  assert(formatIds.includes('fr-text'), 'Format texte français détecté');
}

assert(parseToStandardDate('2024-01-15') === '15/01/2024', 'ISO → 15/01/2024');
assert(parseToStandardDate('15/01/2024') === '15/01/2024', 'JJ/MM/AAAA conservé');
assert(parseToStandardDate('12 janvier 2026') === '12/01/2026', 'Texte FR → 12/01/2026');

const afterDates = unifyAllDateColumns(dirtyTestData, scan.dateColumns);
const dateColIdx = dirtyTestData[0].indexOf('date_inscription');
if (dateColIdx >= 0) {
  assert(
    parseToStandardDate(afterDates[1][dateColIdx]) === '15/01/2024',
    'Ligne 2 date unifiée',
  );
  assert(
    parseToStandardDate(afterDates[2][dateColIdx]) === '15/01/2024',
    'Ligne 3 date unifiée (doublon même date)',
  );
}

console.log('\n5. Propagation (Fill Down)');
const grid = [
  ['a', 'b'],
  ['val', ''],
  ['', ''],
];
const propagated = propagateEmptyCellsDown(grid);
assert(propagated[2][0] === 'val', 'Valeur propagée vers le bas en colonne A');

console.log(`\n=== Résultat : ${passed} OK, ${failed} échec(s) ===\n`);

if (failed > 0) process.exit(1);
