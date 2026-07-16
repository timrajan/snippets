 } catch (err: any) {
                    console.error(`  -> Row ${i}: FAILED.`, err?.message);
                    break;
                }


 } catch (globalError: any) {
        console.error(`\nCRITICAL ERROR: Execution script failed mid-transit: ${globalError.message}`);
    }


 } catch (err: any) {
                    console.error(`  -> Row ${i}: FAILED.`, err?.message);
                    break;
                }

 let workItem: any;
    try {
        workItem = await witClient.createWorkItem(null, patchDocument, projectId, WORK_ITEM_TYPE, false, false, false);
    } catch (err: any) {
        const inner = err?.serverError?.message ?? err?.result?.message ?? err?.message ?? String(err);
        throw new Error(`createWorkItem threw for "${cleanTitle}": ${inner}`);
    }
    if (!workItem || typeof workItem.id !== "number") {
        throw new Error(`createWorkItem returned no numeric id for "${cleanTitle}". Raw: ${JSON.stringify(workItem)}`);
    }
