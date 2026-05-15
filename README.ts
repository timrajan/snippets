async function createAdoTestCase(
    witClient: IWorkItemTrackingApi,
    projectId: string,
    title: string
): Promise<number> {
    const cleanTitle = (title ?? "").trim();
    if (cleanTitle === "") {
        throw new Error("Cannot create Test Case: title is empty.");
    }

    const patchDocument: any[] = [
        { op: "add", path: "/fields/System.Title", value: cleanTitle },
    ];

    if (typeof SHARED_STEP_XML === "string" && SHARED_STEP_XML.trim() !== "") {
        patchDocument.push({
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.Steps",
            value: SHARED_STEP_XML,
        });
    }

    let workItem: any;
    try {
        workItem = await witClient.createWorkItem(
            null,             // customHeaders
            patchDocument,    // document
            projectId,        // project
            WORK_ITEM_TYPE,   // type — must be "Test Case" (with the space)
            false,            // validateOnly
            false,            // bypassRules
            false             // suppressNotifications
        );
    } catch (err: any) {
        const inner =
            err?.serverError?.message ??
            err?.result?.message ??
            err?.message ??
            String(err);
        throw new Error(
            `createWorkItem threw for "${cleanTitle}" (type="${WORK_ITEM_TYPE}"): ${inner}`
        );
    }

    if (!workItem || typeof workItem.id !== "number") {
        throw new Error(
            `createWorkItem returned no numeric id for "${cleanTitle}". ` +
            `Raw response: ${JSON.stringify(workItem)}`
        );
    }

    return workItem.id;
}


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
