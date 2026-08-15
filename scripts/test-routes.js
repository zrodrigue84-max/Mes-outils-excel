/**
 * Tests automatiques — routes volet (alignés sur src/taskpane/types/routes.ts).
 */

const DEFAULT_ROUTE = { view: 'diagnostic', action: 'scan' };

function parseRouteFromSearch(search) {
  const params = new URLSearchParams(search);
  const viewParam = params.get('view');
  const action = params.get('action') ?? '';
  const validViews = ['importer', 'diagnostic', 'transformation', 'combiner', 'automation', 'home'];
  if (viewParam && validViews.includes(viewParam)) {
    return { view: viewParam, action };
  }
  return DEFAULT_ROUTE;
}

const cases = [
  { search: '?view=diagnostic&action=scan', expected: { view: 'diagnostic', action: 'scan' } },
  { search: '?view=importer&action=file', expected: { view: 'importer', action: 'file' } },
  { search: '?view=transformation&action=col-separate', expected: { view: 'transformation', action: 'col-separate' } },
  { search: '?view=combiner&action=merge', expected: { view: 'combiner', action: 'merge' } },
  { search: '?view=automation&action=watch-folder', expected: { view: 'automation', action: 'watch-folder' } },
  { search: '?view=home', expected: { view: 'home', action: '' } },
  { search: '', expected: DEFAULT_ROUTE },
  { search: '?view=invalid&action=x', expected: DEFAULT_ROUTE },
];

let passed = 0;
for (const { search, expected } of cases) {
  const result = parseRouteFromSearch(search);
  const ok = result.view === expected.view && result.action === expected.action;
  if (!ok) {
    console.error(`❌ ${search} → attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(result)}`);
    process.exit(1);
  }
  passed++;
}

console.log(`✅ ${passed} tests de routes OK`);
