TSError: ⨯ Unable to compile TypeScript:
test.ts:10:26 - error TS7016: Could not find a declaration file for module 'xlsx-populate'. 'C:/code/puppeteer/node_modules/xlsx-populate/lib/XlsxPopulate.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/xlsx-populate` if it exists or add a new declaration (.d.ts) file containing `declare module 'xlsx-populate';`

10 import XlsxPopulate from "xlsx-populate";
                           

CRITICAL ERROR: Execution script failed mid-transit: workbook.getWorksheet is not a function




import XlsxPopulate from "xlsx-populate";
// if the import gives you grief: const XlsxPopulate = require("xlsx-populate");

// --- load ---
const excelBuffer = await downloadExcelBuffer(gitClient, repositoryId, PROJECT_ID, FILE_PATH, SOURCE_BRANCH_NAME);
const wb = await XlsxPopulate.fromDataAsync(excelBuffer);
const sheet = wb.sheet(WORKSHEET_NAME);
if (!sheet) throw new Error(`Worksheet "${WORKSHEET_NAME}" not found in workbook.`);

// --- find header columns ---
const endCell = sheet.usedRange().endCell();
const lastCol = endCell.columnNumber();
const lastRow = endCell.rowNumber();

let idColIndex = -1;
let testNameColIndex = -1;
for (let c = 1; c <= lastCol; c++) {
  const v = String(sheet.cell(1, c).value() ?? "").trim();
  if (v === "ADOID") idColIndex = c;
  if (v === "testCaseDescription") testNameColIndex = c;
}
if (idColIndex === -1) throw new Error("ADOID column not found in header row.");
if (testNameColIndex === -1) throw new Error("Test Name column not found in header row.");

// --- params: hoisted out of the loop (they don't change per row) ---
const { paramNames, rows: paramRows } = readParamsFromSheet(wb, PARAMS_SHEET_NAME); // adjust to xlsx-populate API
const parametersXml = buildParametersXml(paramNames);
const localDataSourceXml = buildLocalDataSourceXml(paramNames, paramRows);

// --- row loop ---
const createdIdsBatch: number[] = [];
let changesMade = false;

for (let i = 2; i <= lastRow; i++) {
  const adoidValue = String(sheet.cell(i, idColIndex).value() ?? "").trim();
  const testTitleValue = String(sheet.cell(i, testNameColIndex).value() ?? "").trim();

  if (adoidValue === "") {
    if (testTitleValue === "") {
      console.log(`  -> Row ${i}: Skipped. Blank row template.`);
      continue;
    }
    console.log(`  -> Row ${i}: Missing ADOID. Creating Test Case for "${testTitleValue}"...`);
    try {
      const newId = await createAdoTestCase(witClient, PROJECT_ID, testTitleValue, parametersXml, localDataSourceXml);
      createdIdsBatch.push(newId);
      sheet.cell(i, idColIndex).value(newId);   // formatting on the cell is preserved
      changesMade = true;
      console.log(`  -> Row ${i}: Created Test Case ID: ${newId}`);
      updateMappingFile(newId, FILE_NAME);
      await new Promise((r) => setTimeout(r, 150));
    } catch (err: any) {
      console.error(`  -> Row ${i}: FAILED.`, err?.message);
      break;
    }
  } else {
    console.log(`  -> Row ${i}: Skipped. Already has ID: ${adoidValue}`);
  }
}

// --- link + write + push (unchanged apart from output) ---
if (createdIdsBatch.length > 0) {
  await linkTestCasesToSuite(testClient, PROJECT_ID, PLAN_ID, SUITE_ID, createdIdsBatch);
}

if (changesMade) {
  const outputBuffer = (await wb.outputAsync()) as Buffer;  // Buffer in Node
  require("fs").writeFileSync("C:\\Temp\\debug-output.xlsx", outputBuffer); // verify once, then remove
  await pushExcelToAzureRepos(gitClient, repositoryId, PROJECT_ID, FILE_PATH, SOURCE_BRANCH_NAME, outputBuffer);
} else {
  console.log("Remote repository check-in skipped.\n");
}
