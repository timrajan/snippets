 console.log("[START] Step 6: Processing row modification verification loops sequentially...");
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
                } catch (apiErr: any) {
                    console.error(`  -> Row ${excelRowNo}: FAILED. Sequence interrupted due to API communication break: ${apiErr.message}`);
                    break; 
                }
            } else {
                console.log(`  -> Row ${excelRowNo}: Skipped. Already maps to active tracking entry ID: ${adoidValue}`);
            }
        }
        console.log("[SUCCESS] Step 6: Row processing evaluation sequence is COMPLETE.\n");


FAILED. Sequence interrupted due to API communication break: Failed to retrieve work item ID for title:
