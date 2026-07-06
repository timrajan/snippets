  try {
        // Connect to ADO
        const { gitClient, witClient, testClient } = await connectToAzureDevOps(ORG_URL, PAT);
        // Get the Repository ID
        const repositoryId = await getRepositoryId(gitClient, PROJECT_ID, REPO_NAME);
        // Download the excel sheet
        const excelBuffer = await downloadExcelBuffer(gitClient, repositoryId, PROJECT_ID, FILE_PATH, SOURCE_BRANCH_NAME);
        // Go to the Testcases sheet and load it in memmory
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(excelBuffer as any);
        const worksheet = workbook.getWorksheet(WORKSHEET_NAME);
        if (!worksheet) {
            throw new Error(`Worksheet "${WORKSHEET_NAME}" not found in workbook.`);
        }
        // Loop through each of the rows in the Testcases sheet
        const headerRow = worksheet.getRow(1);
        let idColIndex = -1;
        let testNameColIndex = -1;
        headerRow.eachCell((cell: { value: any }, colNumber: number) => {
            const v = String(cell.value ?? "").trim();
            if (v === "ADOID") idColIndex = colNumber;
            if (v === "testCaseDescription") testNameColIndex = colNumber;
        });
    
        if (idColIndex === -1) throw new Error("ADOID column not found in header row.");
        if (testNameColIndex === -1) throw new Error("Test Name column not found in header row.");

      
        const createdIdsBatch: number[] = [];
        let changesMade = false;

        for (let i = 2; i <= worksheet.rowCount; i++) {
            const row = worksheet.getRow(i);
            const excelRowNo = i; // ExcelJS is already 1-indexed
            const adoidCell = row.getCell(idColIndex);
            const testNameCell = row.getCell(testNameColIndex);

            const adoidValue = String(adoidCell.value ?? "").trim();
            const testTitleValue = String(testNameCell.value ?? "").trim();

            const { paramNames, rows: paramRows } = readParamsFromSheet(workbook, PARAMS_SHEET_NAME);
            const parametersXml = buildParametersXml(paramNames);
            const localDataSourceXml = buildLocalDataSourceXml(paramNames, paramRows);

            if (adoidValue === "") {
                if (testTitleValue === "") {
                    console.log(`  -> Row ${excelRowNo}: Skipped. Cell data maps to a completely blank row template.`);
                    continue;
                }
                console.log(`  -> Row ${excelRowNo}: Missing ADOID detected. Commencing Test Case generation for "${testTitleValue}"...`);

                try {
                    const newId = await createAdoTestCase(witClient, PROJECT_ID, testTitleValue, parametersXml, localDataSourceXml);
                    createdIdsBatch.push(newId);
                    adoidCell.value = newId; // value-only update; cell formatting preserved
                    changesMade = true;
                    console.log(`  -> Row ${excelRowNo}: Successfully generated Test Case ID: ${newId}`);
                    updateMappingFile(newId,FILE_NAME);
                    await new Promise((resolve) => setTimeout(resolve, 150));
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

        // --- Link new Test Cases to the configured Suite
        if (createdIdsBatch.length > 0) {
            await linkTestCasesToSuite(testClient, PROJECT_ID, PLAN_ID, SUITE_ID, createdIdsBatch);
        }

        // === STEP 8: Serialize and push the modified and updated excel to the remote
        if (changesMade) {
            const arrayBuffer = await workbook.xlsx.writeBuffer();
            const outputBuffer = Buffer.from(arrayBuffer as ArrayBuffer);

            await pushExcelToAzureRepos(gitClient, repositoryId, PROJECT_ID, FILE_PATH, SOURCE_BRANCH_NAME, outputBuffer);
        } else {
            console.log("Remote repository check-in skipped.\n");
        }

        console.log("Automation Sync Workflow execution finished completely and successfully.");
    } catch (globalError: any) {
        console.error(`\nCRITICAL ERROR: Execution script failed mid-transit: ${globalError.message}`);
    }
