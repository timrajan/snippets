const PARAMS_SHEET_NAME = "Params";   // change if your sheet has a different name

console.log(`[START] Step 5b: Reading shared parameters from "${PARAMS_SHEET_NAME}" sheet...`);
const { paramNames, rows: paramRows } = readParamsFromSheet(workbook, PARAMS_SHEET_NAME);
const parametersXml      = buildParametersXml(paramNames);
const localDataSourceXml = buildLocalDataSourceXml(paramNames, paramRows);
console.log(`[DEBUG] Params columns: ${paramNames.join(", ")}`);
console.log(`[DEBUG] Params data rows: ${paramRows.length}`);
console.log("[SUCCESS] Step 5b: Parameter source built.\n");


const newId = await createAdoTestCase(
    witClient,
    PROJECT_ID,
    testTitleValue,
    parametersXml,
    localDataSourceXml
);
