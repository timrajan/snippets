import * as XLSX from 'xlsx';

/**
 * Gets all sheet names from an Excel buffer
 * @param buffer - The Excel file buffer
 * @returns string[] - Array of sheet names
 */
function getSheetNames(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  return workbook.SheetNames;
}
