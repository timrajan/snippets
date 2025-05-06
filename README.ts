/**
 * Get all test cases from a test suite by suite name
 * @param config Azure DevOps configuration
 * @param suiteName Name of the test suite to find
 * @returns Array of test case info objects
 */
async function getTestCasesBySuiteName(
  config: Config,
  suiteName: string
): Promise<TestCaseInfo[]> {
  try {
    // Setup authentication
    const authHandler = azdev.getPersonalAccessTokenHandler(config.token);
    const connection = new azdev.WebApi(config.orgUrl, authHandler);
    
    // Get Test Plan API
    const testPlanApi = await connection.getTestPlanApi();
    
    // First, get all test plans in the project
    console.log(`Fetching test plans in project ${config.project}...`);
    const testPlans = await testPlanApi.getPlans(config.project);
    
    // Used to store our results
    const testCases: TestCaseInfo[] = [];
    
    // Iterate through each test plan to find the suite
    for (const plan of testPlans) {
      if (plan.id === undefined) continue;
      
      console.log(`Checking test plan: ${plan.name} (ID: ${plan.id})`);
      
      // Get all suites for this plan
      const suites = await testPlanApi.getTestSuitesByPlanId(config.project, plan.id);
      
      // Find the suite with the matching name
      const matchingSuite = suites.find(suite => suite.name === suiteName);
      
      if (matchingSuite && matchingSuite.id !== undefined) {
        console.log(`Found matching test suite: ${matchingSuite.name} (ID: ${matchingSuite.id})`);
        
        // Get test cases for this suite
        const suiteCases = await testPlanApi.getTestCaseList(
          config.project,
          plan.id,
          matchingSuite.id,
          /* testIds */ undefined,
          /* configurationIds */ undefined,
          /* witFields */ 'System.State,Microsoft.VSTS.Common.Priority',
          /* continuationToken */ undefined,
          /* returnIdentityRef */ true,
          /* expand */ true,
          /* excludeFlags */ 0,
          /* isRecursive */ false
        );
        
        // Map the test cases to a simpler format
        for (const testCase of suiteCases) {
          if (testCase.workItem?.id !== undefined && testCase.workItem?.name !== undefined) {
            // Extract state and priority if available
            let state: string | undefined;
            let priority: string | number | undefined;
            
            if (testCase.workItem.workItemFields) {
              const stateField = testCase.workItem.workItemFields.find(f => f.field?.name === 'State');
              if (stateField) {
                state = stateField.value?.toString();
              }
              
              const priorityField = testCase.workItem.workItemFields.find(f => f.field?.name === 'Priority');
              if (priorityField) {
                priority = priorityField.value;
              }
            }
            
            testCases.push({
              id: testCase.workItem.id,
              name: testCase.workItem.name,
              state,
              priority
            });
          }
        }
        
        // Since we found our suite, we can exit the search
        return testCases;
      }
    }
    
    // If we reach here, we didn't find the suite
    console.log(`No test suite found with name: ${suiteName}`);
    return [];
    
  } catch (error) {
    console.error('Error fetching test cases:', (error as Error).message);
    throw error;
  }
}
