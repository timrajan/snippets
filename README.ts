 for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const excelRowNo = i + 1;

            const adoidValue = String(row[idColIndex]).trim();
            const testTitleValue = String(row[testNameColIndex]).trim();

            if (adoidValue === "") {
                if (testTitleValue === "") {
                    console.log(`  -> Row ${excelRowNo}: Skipped. Cell data maps to a completely blank row template.`);
                    continue;
                }

                console.log(`  -> Row ${excelRowNo}: Missing ADOID detected. Commencing Test Case generation for "${testTitleValue}"...`);
            

                try {
                    const newId = await createAdoTestCase(witClient, PROJECT_ID, testTitleValue);
                    createdIdsBatch.push(newId);
                    row[idColIndex] = newId;
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

        if (createdIdsBatch.length > 0) {
            await linkTestCasesToSuite(testClient, PROJECT_ID, PLAN_ID, SUITE_ID, createdIdsBatch);
        }

        if (changesMade) {
            const updatedWorksheet = XLSX.utils.aoa_to_sheet(rows);
            workbook.Sheets[WORKSHEET_NAME] = updatedWorksheet;
            
            const outputBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
            await pushExcelToAzureRepos(gitClient, repositoryId, PROJECT_ID, FILE_PATH, SOURCE_BRANCH_NAME, outputBuffer);
        } else {
            console.log("[INFO] Step 8: Remote repository check-in skipped. Memory cells contain zero changes.\n");
        }
