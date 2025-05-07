/**
 * Get all test cases from all test suites in a test plan
 * @param config Azure DevOps configuration
 * @param planId Test plan ID
 * @returns Map of suite ID to test cases
 */
async function getAllTestCasesFromPlan(config: Config, planId: number) {
  try {
    // First get all test suites in the plan
    const testSuites = await getAllTestSuitesFromPlan(config, planId);
    
    console.log(`Fetching test cases for ${testSuites.length} suites in plan ID ${planId}...`);
    
    // Create axios instance with Basic authentication
    const axiosInstance = axios.create({
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${config.token}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Map to store test cases for each suite
    const testCasesBySuite = new Map();
    
    // For each suite, get its test cases
    for (const suite of testSuites) {
      try {
        console.log(`Fetching test cases for suite ID ${suite.id} (${suite.name})...`);
        
        // Construct the URL for the API request
        const url = `${config.orgUrl}/${config.project}/_apis/test/Plans/${planId}/suites/${suite.id}/testcases?api-version=7.1`;
        
        // Make the REST API call
        const response = await axiosInstance.get(url);
        
        const testCases = response.data.value || [];
        console.log(`Found ${testCases.length} test cases in suite ID ${suite.id}`);
        
        // Store the test cases for this suite
        testCasesBySuite.set(suite.id, {
          suite: suite,
          testCases: testCases
        });
      } catch (error) {
        console.error(`Error fetching test cases for suite ID ${suite.id}:`, error);
        // Continue with other suites even if one fails
      }
    }
    
    return testCasesBySuite;
  } catch (error) {
    console.error(`Error fetching all test cases from plan ID ${planId}:`, error);
    throw error;
  }
}
