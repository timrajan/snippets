Based on the last discussion, what we had was that we need only accessible names to identify the whole elements in the page. So, created a small logic where with our existing spreadsheet with the existing IDs, when we run it, we will be able to capture all the accessible names with the IDs. We don't have to manually go into Chrome Console and fetch those accessible names. Once we get all those accessible names, we can either drop it in a big lookup or take up the existing Excel and update it with the accessible names and run the entire test. These are some of the options. I like the idea of having this lookup, but the only thing is, who is going to maintain that lookup? Or else, we can just pick up one spreadsheet, update that's as a building names in that spreadsheet, and just finish off that test. These are some of the options. Happy to discuss, but this video gives you a clear picture. 


https://www.youtube.com/shorts/m_OghVvNnNc

import * as fs from 'fs';

const logFile = 'test-logs.txt';
fs.writeFileSync(logFile, ''); // Clear file at start

export function log(...args: any[]): void {
  const message = args.join(' ');
  console.log(message);
  fs.appendFileSync(logFile, message + '\n');
}

// Usage
log('Step 1');
log('Step 2');



const element = await page.$(selector);

const snapshot = await page.accessibility.snapshot({ root: element });

const accessibleName = snapshot?.name;
console.log(accessibleName);



const cleanedKeys = uniqueKeys.map(key => key.replace("str", ""));


const uniqueKeys = Array.from(new Set(
  records
    .flatMap(record => Object.keys(record))
    .filter(key => key.startsWith("str"))
));



const allKeys = records.flatMap(record => Object.keys(record));
.filter(key => key.toLowerCase().startsWith("str"));
/**
 * Filters rows where a column matches a specific value
 * @param sheetData - Array of rows from the sheet
 * @param columnName - The column name to filter on (e.g., 'car')
 * @param filterValue - The value to filter by (e.g., 'Toyota')
 * @returns ExcelRow[] - Array of matching rows
 */
function filterRowsByColumnValue(
  sheetData: ExcelRow[],
  columnName: string,
  filterValue: string
): ExcelRow[] {
  return sheetData.filter((row: ExcelRow) => {
    const cellValue = row[columnName];
    return cellValue?.toString().toLowerCase() === filterValue.toLowerCase();
  });
}




const selector = `input[type="radio"][value="${value}"]`;
  
  // Click to select
  await page.click(selector);


for (const [name, value] of result) {
  switch (name) {
    case 'cat2lex':
      console.log('This is a cat:', value);
      break;
    case 'humans2lex':
      console.log('This is a human:', value);
      break;
    case 'bird3lex':
      console.log('This is a bird:', value);
      break;
    default:
      console.log('Unknown:', name, value);
      break;
  }
}



for (const [name, value] of result) {
  console.log(`${name}: ${value}`);
}
// Output:
// cat2lex: 4 legs
// humans2lex: 2 legs



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
