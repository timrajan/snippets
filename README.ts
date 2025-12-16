type ExcelRow = Record<string, unknown>;

/**
 * Checks if any row has a specific value in a specific column
 * @param sheetData - Array of rows from the sheet
 * @param columnName - The column name to search in (e.g., 'control')
 * @param value - The value to search for (e.g., 'button')
 * @returns boolean - True if value exists in any row
 */
function hasValueInColumn(
  sheetData: ExcelRow[],
  columnName: string,
  value: string
): boolean {
  return sheetData.some((row: ExcelRow) => {
    const cellValue = row[columnName];
    return cellValue?.toString().toLowerCase() === value.toLowerCase();
  });
}
