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


type ExcelRow = Record<string, unknown>;

/**
 * Finds a row by column value and returns the value of another column from that row
 * @param sheetData - Array of rows from the sheet
 * @param searchColumnName - The column name to search in (e.g., 'control')
 * @param searchValue - The value to search for (e.g., 'button')
 * @param returnColumnName - The column name whose value to return (e.g., 'options')
 * @returns string - The value of the return column or empty string if not found
 */
function getColumnValueByMatch(
  sheetData: ExcelRow[],
  searchColumnName: string,
  searchValue: string,
  returnColumnName: string
): string {
  const matchingRow = sheetData.find((row: ExcelRow) => {
    const cellValue = row[searchColumnName];
    return cellValue?.toString().toLowerCase() === searchValue.toLowerCase();
  });

  if (!matchingRow) {
    return '';
  }

  const value = matchingRow[returnColumnName];
  
  return value !== null && value !== undefined ? value.toString() : '';
}
