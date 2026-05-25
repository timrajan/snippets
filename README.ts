async function createAdoTestCase(
    witClient: IWorkItemTrackingApi,
    projectId: string,
    title: string,
    parametersXml: string,
    localDataSourceXml: string
): Promise<number> {
    const cleanTitle = (title ?? "").trim();
    if (!cleanTitle) throw new Error("Cannot create Test Case: title is empty.");

    const patchDocument: any[] = [
        { op: "add", path: "/fields/System.Title",         value: cleanTitle },
        { op: "add", path: "/fields/System.AreaPath",      value: AREA_PATH },
        { op: "add", path: "/fields/System.IterationPath", value: ITERATION_PATH },
    ];

    if (SHARED_STEP_XML?.trim()) {
        patchDocument.push({
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.Steps",
            value: SHARED_STEP_XML,
        });
    }
    if (parametersXml?.trim()) {
        patchDocument.push({
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.Parameters",
            value: parametersXml,
        });
    }
    if (localDataSourceXml?.trim()) {
        patchDocument.push({
            op: "add",
            path: "/fields/Microsoft.VSTS.TCM.LocalDataSource",
            value: localDataSourceXml,
        });
    }

    let workItem: any;
    try {
        workItem = await witClient.createWorkItem(
            null, patchDocument, projectId, WORK_ITEM_TYPE, false, false, false
        );
    } catch (err: any) {
        const inner = err?.serverError?.message ?? err?.result?.message ?? err?.message ?? String(err);
        throw new Error(`createWorkItem threw for "${cleanTitle}": ${inner}`);
    }
    if (!workItem || typeof workItem.id !== "number") {
        throw new Error(`createWorkItem returned no numeric id for "${cleanTitle}". Raw: ${JSON.stringify(workItem)}`);
    }
    return workItem.id;
}
