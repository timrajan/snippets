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

    // Only attach Steps if SHARED_STEP_XML is defined and non-empty — lets us isolate it.
    if (typeof SHARED_STEP_XML === "string" && SHARED_STEP_XML.trim() !== "") {
        patchDocument.push({
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.Steps",
            value: SHARED_STEP_XML,
        });
    }

    let workItem;
    try {
        workItem = await witClient.createWorkItem(
            null,            // customHeaders
            patchDocument,   // document
            projectId,       // project
            WORK_ITEM_TYPE,  // type, e.g. "Test Case"
            false,           // validateOnly
            false,           // bypassRules
            false            // suppressNotifications
        );
    } catch (err: any) {
        const inner =
            err?.serverError?.message ??
            err?.result?.message ??
            err?.message ??
            String(err);
        throw new Error(
            `createWorkItem threw for title "${cleanTitle}" (type="${WORK_ITEM_TYPE}"): ${inner}`
        );
    }

    if (!workItem || typeof workItem.id !== "number") {
        throw new Error(
            `createWorkItem returned no id for title "${cleanTitle}". ` +
            `Type="${WORK_ITEM_TYPE}", project="${projectId}". ` +
            `Raw response: ${JSON.stringify(workItem)}`
        );
    }

    return workItem.id;
}
