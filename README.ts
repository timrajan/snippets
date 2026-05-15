import ExcelJS from "exceljs";

// === STEP 4: Load workbook with ExcelJS (preserves styles) ===
console.log("[START] Step 4: Loading workbook into ExcelJS engine...");
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(excelBuffer as any);
const worksheet = workbook.getWorksheet(WORKSHEET_NAME);
if (!worksheet) {
    throw new Error(`Worksheet "${WORKSHEET_NAME}" not found in workbook.`);
}
console.log(`[DEBUG] Workbook loaded. Sheet "${worksheet.name}" has ${worksheet.rowCount} rows.`);

// === STEP 5: Locate ADOID and Test Name columns ===
console.log("[START] Step 5: Locating ADOID and Test Name columns in header...");
const headerRow = worksheet.getRow(1);
let idColIndex = -1;
let testNameColIndex = -1;
headerRow.eachCell((cell, colNumber) => {
    const v = String(cell.value ?? "").trim();
    if (v === "ADOID")     idColIndex       = colNumber;
    if (v === "Test Name") testNameColIndex = colNumber;
});
if (idColIndex === -1)       throw new Error("ADOID column not found in header row.");
if (testNameColIndex === -1) throw new Error("Test Name column not found in header row.");
console.log(`[DEBUG] ADOID col=${idColIndex}, Test Name col=${testNameColIndex}`);

// === STEP 6: Process rows sequentially ===
console.log("[START] Step 6: Processing row modification verification loops sequentially...");
const createdIdsBatch: number[] = [];
let changesMade = false;

for (let i = 2; i <= worksheet.rowCount; i++) {
    const row          = worksheet.getRow(i);
    const excelRowNo   = i;                              // ExcelJS is already 1-indexed
    const adoidCell    = row.getCell(idColIndex);
    const testNameCell = row.getCell(testNameColIndex);

    const adoidValue     = String(adoidCell.value    ?? "").trim();
    const testTitleValue = String(testNameCell.value ?? "").trim();

    if (adoidValue === "") {
        if (testTitleValue === "") {
            console.log(`  -> Row ${excelRowNo}: Skipped. Cell data maps to a completely blank row template.`);
            continue;
        }
        console.log(`  -> Row ${excelRowNo}: Missing ADOID detected. Commencing Test Case generation for "${testTitleValue}"...`);

        try {
            const newId = await createAdoTestCase(witClient, PROJECT_ID, testTitleValue);
            createdIdsBatch.push(newId);
            adoidCell.value = newId;                     // value-only update; cell formatting preserved
            changesMade = true;
            console.log(`  -> Row ${excelRowNo}: Successfully generated Test Case ID: ${newId}`);
            await new Promise(resolve => setTimeout(resolve, 150));
        } catch (err: any) {
            console.error(`  -> Row ${excelRowNo}: FAILED.`);
            console.error("    name:          ", err?.name);
            console.error("    message:       ", err?.message);
            console.error("    code:          ", err?.code);
            console.error("    statusCode:    ", err?.statusCode);
            console.error("    cause:         ", err?.cause);
            console.error("    cause.code:    ", err?.cause?.code);
            console.error("    cause.message: ", err?.cause?.message);
            console.error("    stack:         ", err?.stack);
            break;
        }
    } else {
        console.log(`  -> Row ${excelRowNo}: Skipped. Already maps to active tracking entry ID: ${adoidValue}`);
    }
}
console.log("[SUCCESS] Step 6: Row processing evaluation sequence is COMPLETE.\n");

// === STEP 7: Link new Test Cases to the configured Suite ===
if (createdIdsBatch.length > 0) {
    await linkTestCasesToSuite(testClient, PROJECT_ID, PLAN_ID, SUITE_ID, createdIdsBatch);
}

// === STEP 8: Serialize and push (only if rows changed) ===
if (changesMade) {
    console.log("[START] Step 8: Serializing workbook (with styles preserved) and pushing to Azure Repos...");
    const arrayBuffer  = await workbook.xlsx.writeBuffer();
    const outputBuffer = Buffer.from(arrayBuffer as ArrayBuffer);
    console.log(`[DEBUG] Updated workbook size: ${outputBuffer.length} bytes.`);

    await pushExcelToAzureRepos(
        gitClient,
        repositoryId,
        PROJECT_ID,
        FILE_PATH,
        SOURCE_BRANCH_NAME,
        outputBuffer
    );
} else {
    console.log("[INFO] Step 8: Remote repository check-in skipped. Memory cells contain zero changes.\n");
}
