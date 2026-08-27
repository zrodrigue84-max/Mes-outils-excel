/**
 * Accès Excel — lecture CurrentRegion et écriture avec un seul context.sync() par opération.
 */
import {
  removeEmptyRows,
  fillEmptyCellsWithZero,
  propagateEmptyCellsDown,
  unifyAllDateColumns,
  runClinicalScan,
} from './clinicalScan';

export type CellValue = string | number | boolean | null;

export interface RegionData {
  values: CellValue[][];
  address: string;
  rowCount: number;
  columnCount: number;
}

function applyValuesToRegion(
  region: Excel.Range,
  newValues: CellValue[][],
  originalRowCount: number,
  columnCount: number,
) {
  const newRowCount = newValues.length;

  if (newRowCount === originalRowCount) {
    region.values = newValues as Excel.Range['values'];
    return;
  }

  const writeRange = region.getCell(0, 0).getResizedRange(newRowCount - 1, columnCount - 1);
  writeRange.values = newValues as Excel.Range['values'];

  if (newRowCount < originalRowCount) {
    const extraRowCount = originalRowCount - newRowCount;
    const deleteRange = region
      .getCell(newRowCount, 0)
      .getResizedRange(extraRowCount - 1, columnCount - 1);
    deleteRange.delete(Excel.DeleteShiftDirection.up);
  }
}

/** Lit la zone courante (CurrentRegion) autour de la sélection active. */
export async function readCurrentRegion(): Promise<RegionData> {
  return Excel.run(async (context) => {
    const selection = context.workbook.getSelectedRange();
    const region = selection.getCurrentRegion();
    region.load(['values', 'address', 'rowCount', 'columnCount']);
    await context.sync();

    return {
      values: region.values as CellValue[][],
      address: region.address,
      rowCount: region.rowCount,
      columnCount: region.columnCount,
    };
  });
}

/** Lance le scan clinique sur la zone sélectionnée dans Excel. */
export async function scanCurrentRegion() {
  const region = await readCurrentRegion();
  const scan = runClinicalScan(region.values);
  return { ...scan, address: region.address };
}

async function mutateRegion(transform: (values: CellValue[][]) => CellValue[][]): Promise<void> {
  await Excel.run(async (context) => {
    const region = context.workbook.getSelectedRange().getCurrentRegion();
    region.load(['values', 'rowCount', 'columnCount']);
    await context.sync();

    const originalRowCount = region.rowCount;
    const columnCount = region.columnCount;
    const newValues = transform(region.values as CellValue[][]);

    applyValuesToRegion(region, newValues, originalRowCount, columnCount);
    await context.sync();
  });
}

export async function deleteEmptyRowsInRegion(): Promise<number> {
  let deleted = 0;
  await Excel.run(async (context) => {
    const region = context.workbook.getSelectedRange().getCurrentRegion();
    region.load(['values', 'rowCount', 'columnCount']);
    await context.sync();

    const original = region.values as CellValue[][];
    const newValues = removeEmptyRows(original);
    deleted = original.length - newValues.length;

    applyValuesToRegion(region, newValues, region.rowCount, region.columnCount);
    await context.sync();
  });
  return deleted;
}

export async function fillEmptyCellsWithZeroInRegion(): Promise<void> {
  await mutateRegion(fillEmptyCellsWithZero);
}

export async function propagateEmptyCellsInRegion(): Promise<void> {
  await mutateRegion(propagateEmptyCellsDown);
}

export async function unifyDatesInRegion(
  dateColumns: Array<{ columnIndex: number }>,
): Promise<void> {
  await mutateRegion((values) => unifyAllDateColumns(values, dateColumns));
}
