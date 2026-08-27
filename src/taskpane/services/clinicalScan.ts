/**
 * Scan clinique — réexport typé de la logique pure partagée avec le test terminal.
 */
export {
  isEmptyCell,
  isEmptyRow,
  detectDateFormat,
  parseToStandardDate,
  formatDateFR,
  runClinicalScan,
  removeEmptyRows,
  fillEmptyCellsWithZero,
  propagateEmptyCellsDown,
  unifyDateColumn,
  unifyAllDateColumns,
} from '../../../scripts/clinical-scan-core.js';

/** Résultat du scan clinique local. */
export interface ClinicalScanResult {
  rowCount: number;
  columnCount: number;
  dataRowCount: number;
  address?: string;
  header: string[];
  emptyRowCount: number;
  emptyRowIndices: number[];
  emptyCellCount: number;
  dateColumns: Array<{
    columnIndex: number;
    header: string;
    formats: Array<{ format: string; label: string; count: number }>;
    sampleValues: string[];
  }>;
  hasMixedDateFormats: boolean;
}
