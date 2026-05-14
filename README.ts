/**
 * 5. Calls the Work Item Tracking API to provision a single Test Case.
 */
async function createAdoTestCase(witClient: IWorkItemTrackingApi, projectId: string, title: string): Promise<number> {
    const patchDocument = [
        { op: "add", path: "/fields/System.Title", value: title },
        { op: "add", path: "/fields/Microsoft.VSTS.TCM.Steps", value: SHARED_STEP_XML }
    ];

    const workItem = await witClient.createWorkItem(null, patchDocument, projectId, WORK_ITEM_TYPE);
    if (!workItem || !workItem.id) {
        throw new Error(`Failed to retrieve work item ID for title: "${title}"`);
    }
    return workItem.id;
}
