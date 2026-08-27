/**
 * Scan clinique local — logique pure JavaScript (sans Excel, sans IA).
 * Partagée entre le volet React et le test terminal scripts/test-clinical-scan.js
 */

const MONTH_MAP = {
  janvier: 0, février: 1, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, aout: 7, septembre: 8, octobre: 9, novembre: 10,
  décembre: 11, decembre: 11,
};

const MONTHS_FR = Object.keys(MONTH_MAP);

export function isEmptyCell(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

export function isEmptyRow(row) {
  return row.every(isEmptyCell);
}

/** Détecte le format d'une valeur date potentielle. */
export function detectDateFormat(value) {
  if (isEmptyCell(value)) return null;
  if (typeof value === 'number' && value > 1000 && value < 100000) return 'excel-serial';

  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return 'iso';
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return 'fr-slash';
  if (/^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(s)) return 'fr-slash';

  const lower = s.toLowerCase();
  for (const month of MONTHS_FR) {
    if (lower.includes(month)) return 'fr-text';
  }
  return null;
}

const FORMAT_LABELS = {
  iso: 'AAAA-MM-JJ (ISO)',
  'fr-slash': 'JJ/MM/AAAA',
  'fr-text': 'Texte français (ex. 12 janvier 2026)',
  'excel-serial': 'Numéro de série Excel',
};

function excelSerialToDate(serial) {
  const utcDays = Math.floor(serial - 25569);
  return new Date(utcDays * 86400 * 1000);
}

function parseFrenchTextDate(text) {
  const lower = text.toLowerCase().trim();
  for (const month of MONTHS_FR) {
    const idx = lower.indexOf(month);
    if (idx === -1) continue;
    const dayMatch = lower.slice(0, idx).match(/(\d{1,2})/);
    const yearMatch = lower.slice(idx + month.length).match(/(\d{4})/);
    if (dayMatch && yearMatch) {
      const monthIndex = MONTH_MAP[month];
      if (monthIndex !== undefined) {
        return new Date(Number(yearMatch[1]), monthIndex, Number(dayMatch[1]));
      }
    }
  }
  return null;
}

/** Convertit une valeur date en JJ/MM/AAAA ou null. */
export function parseToStandardDate(value) {
  if (isEmptyCell(value)) return null;

  if (typeof value === 'number') {
    const d = excelSerialToDate(value);
    return formatDateFR(d);
  }

  const s = String(value).trim();

  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return formatDateFR(new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));
  }

  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return formatDateFR(new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1])));
  }

  const frDate = parseFrenchTextDate(s);
  if (frDate && !Number.isNaN(frDate.getTime())) return formatDateFR(frDate);

  return null;
}

export function formatDateFR(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Analyse un tableau 2D (ligne 0 = en-têtes). */
export function runClinicalScan(values) {
  if (!values || values.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      dataRowCount: 0,
      address: '',
      header: [],
      emptyRowCount: 0,
      emptyRowIndices: [],
      emptyCellCount: 0,
      dateColumns: [],
      hasMixedDateFormats: false,
    };
  }

  const header = values[0].map((c) => (c == null ? '' : String(c)));
  const columnCount = header.length;
  const rowCount = values.length;
  const dataRows = values.slice(1);

  const emptyRowIndices = [];
  dataRows.forEach((row, i) => {
    if (isEmptyRow(row)) emptyRowIndices.push(i + 1);
  });

  let emptyCellCount = 0;
  for (let r = 1; r < values.length; r++) {
    for (let c = 0; c < columnCount; c++) {
      if (isEmptyCell(values[r][c])) emptyCellCount++;
    }
  }

  const dateColumns = [];
  let hasMixedDateFormats = false;

  for (let c = 0; c < columnCount; c++) {
    const formatCounts = {};
    const samples = [];

    for (let r = 1; r < values.length; r++) {
      const val = values[r][c];
      const fmt = detectDateFormat(val);
      if (!fmt) continue;
      formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
      if (samples.length < 3) samples.push(String(val));
    }

    const totalDates = Object.values(formatCounts).reduce((a, b) => a + b, 0);
    if (totalDates === 0) continue;

    const nonEmptyInCol = dataRows.filter((row) => !isEmptyCell(row[c])).length;
    if (totalDates < Math.max(1, Math.floor(nonEmptyInCol * 0.3))) continue;

    const formats = Object.entries(formatCounts).map(([format, count]) => ({
      format,
      label: FORMAT_LABELS[format] || format,
      count,
    }));

    if (formats.length > 1) hasMixedDateFormats = true;

    dateColumns.push({
      columnIndex: c,
      header: header[c] || `Colonne ${c + 1}`,
      formats,
      sampleValues: samples,
    });
  }

  return {
    rowCount,
    columnCount,
    dataRowCount: dataRows.length,
    header,
    emptyRowCount: emptyRowIndices.length,
    emptyRowIndices,
    emptyCellCount,
    dateColumns,
    hasMixedDateFormats,
  };
}

export function removeEmptyRows(values) {
  if (values.length === 0) return values;
  return [values[0], ...values.slice(1).filter((row) => !isEmptyRow(row))];
}

export function fillEmptyCellsWithZero(values) {
  return values.map((row) => row.map((cell) => (isEmptyCell(cell) ? 0 : cell)));
}

export function propagateEmptyCellsDown(values) {
  const result = values.map((row) => [...row]);
  const cols = result[0]?.length ?? 0;
  for (let c = 0; c < cols; c++) {
    for (let r = 1; r < result.length; r++) {
      if (isEmptyCell(result[r][c]) && !isEmptyCell(result[r - 1][c])) {
        result[r][c] = result[r - 1][c];
      }
    }
  }
  return result;
}

export function unifyDateColumn(values, columnIndex) {
  const result = values.map((row) => [...row]);
  for (let r = 1; r < result.length; r++) {
    const parsed = parseToStandardDate(result[r][columnIndex]);
    if (parsed) result[r][columnIndex] = parsed;
  }
  return result;
}

export function unifyAllDateColumns(values, dateColumns) {
  let result = values.map((row) => [...row]);
  for (const col of dateColumns) {
    result = unifyDateColumn(result, col.columnIndex);
  }
  return result;
}
