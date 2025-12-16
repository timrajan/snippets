const result: [string, string][] = [];

for (const item of sourceArray) {
  const parts = item.split('|');
  result.push([parts[0], parts[1]]);
}

const sourceArray: string[] = ['cat2lex|4 legs', 'Tiger2lex|no legs', 'humans2lex|2 legs', 'DOG3lex|4 legs'];

const result: [string, string][] = [];

for (const item of sourceArray) {
  const parts = item.split('|');
  const nameLower = parts[0].toLowerCase();
  
  if (nameLower.includes('tiger') || nameLower.includes('dog')) {
    continue;
  }
  result.push([parts[0], parts[1]]);
}

console.log(result);
// Output: [['cat2lex', '4 legs'], ['humans2lex', '2 legs']]


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
