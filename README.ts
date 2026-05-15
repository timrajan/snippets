/**
 * 6. Associates an array of Test Case IDs to a specific Test Suite in one operation.
 */
async function linkTestCasesToSuite(
    testClient: ITestPlanApi,
    projectId: string,
    planId: string,
    suiteId: string,
    testCaseIds: number[]
): Promise<void> {
    if (testCaseIds.length === 0) {
        console.log("[INFO] Step 7: Skipped — no Test Case IDs to link.");
        return;
    }

    console.log(
        `[START] Step 7: Linking ${testCaseIds.length} Test Case(s) to ` +
        `plan ${planId} / suite ${suiteId}...`
    );

    const suitePayload = testCaseIds.map(id => ({
        workItem: { id: id },   // pass as number — API accepts both, but number matches the typed interface
    }));

    const result = await testClient.addTestCasesToSuite(
        suitePayload,
        projectId,
        parseInt(planId, 10),
        parseInt(suiteId, 10)
    );

    if (!result || result.length === 0) {
        throw new Error(
            `addTestCasesToSuite returned no linked cases. ` +
            `Verify suite ${suiteId} belongs to plan ${planId} and is a Static suite.`
        );
    }

    console.log(
        `[SUCCESS] Step 7: Linked ${result.length} Test Case(s) to suite ${suiteId}.\n`
    );
}



const patchDocument: any[] = [
    { op: "add", path: "/fields/System.Title",          value: cleanTitle },
    { op: "add", path: "/fields/System.AreaPath",       value: AREA_PATH },
    { op: "add", path: "/fields/System.IterationPath",  value: ITERATION_PATH },
];


