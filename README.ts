const restClient: any = (witClient as any).rest;
const probeUrl =
    `_apis/wit/workitems/$${encodeURIComponent(WORK_ITEM_TYPE)}?api-version=7.1`;
const probe = await restClient.create(probeUrl, patchDocument, {
    acceptHeader: "application/json",
    additionalHeaders: { "Content-Type": "application/json-patch+json" },
});
console.log("[PROBE] statusCode:", probe.statusCode);
console.log("[PROBE] result:", JSON.stringify(probe.result));




async function createAdoTestCase(
    witClient: IWorkItemTrackingApi,
    projectId: string,
    title: string
): Promise<number> {
    const cleanTitle = (title ?? "").trim();
    if (cleanTitle === "") {
        throw new Error("Cannot create Test Case: title is empty.");
    }

    console.log(
        `[DEBUG] createWorkItem -> project="${projectId}", type="${WORK_ITEM_TYPE}", title="${cleanTitle}"`
    );

    const patchDocument: any[] = [
        { op: "add", path: "/fields/System.Title", value: cleanTitle },
    ];

    let workItem: any;
    try {
        workItem = await witClient.createWorkItem(
            null,             // customHeaders
            patchDocument,    // document
            projectId,        // project
            WORK_ITEM_TYPE,   // type
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
        console.error("[DEBUG] createWorkItem threw. Full error dump:");
        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        throw new Error(`createWorkItem threw for "${cleanTitle}": ${inner}`);
    }

    // Aggressive logging — independent statements so nothing gets truncated together
    console.log("[DEBUG] response typeof:", typeof workItem);
    console.log("[DEBUG] response is null/undefined?:", workItem === null || workItem === undefined);
    if (workItem && typeof workItem === "object") {
        console.log("[DEBUG] response keys:", Object.keys(workItem));
        console.log("[DEBUG] response.id value:", workItem.id, "typeof:", typeof workItem.id);
        console.log("[DEBUG] response.url:", workItem.url);
        console.log("[DEBUG] response.fields keys:",
            workItem.fields ? Object.keys(workItem.fields) : "(no fields object)");
    }
    console.log("[DEBUG] full JSON dump:");
    console.log(JSON.stringify(workItem, null, 2));

    if (!workItem || typeof workItem.id !== "number") {
        throw new Error(
            `createWorkItem returned no numeric id for "${cleanTitle}" — see [DEBUG] dump above for response shape.`
        );
    }

    return workItem.id;
}
