/**
 * 6. Associates an array of Test Case IDs to a specific Test Suite in one operation.
 */
async function linkTestCasesToSuite(testClient: ITestPlanApi, projectId: string, planId: string, suiteId: string, testCaseIds: number[]): Promise<void> {
    console.log(`[START] Step 7: Executing bulk link process for ${testCaseIds.length} generated Test Cases inside Suite...`);
    const suitePayload: any[] = testCaseIds.map(id => ({
        workItem: { id: String(id) }
    }));

    await testClient.addTestCasesToSuite(suitePayload, projectId, parseInt(planId), parseInt(suiteId));
    console.log("[SUCCESS] Step 7: Bulk Suite allocation update is COMPLETE.\n");
}


await linkTestCasesToSuite(testClient, PROJECT_ID, PLAN_ID, SUITE_ID, createdIdsBatch);
