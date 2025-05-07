/**
 * Get all test suites from a specific test plan
 * Handles pagination to retrieve all suites
 * @param config Azure DevOps configuration
 * @param planId Test plan ID
 * @returns All test suites in the test plan
 */
async function getAllTestSuitesFromPlan(config: Config, planId: number) {
  try {
    // Create axios instance with Basic authentication
    const axiosInstance = axios.create({
      headers: {
        'Authorization': `Basic ${Buffer.from(`:${config.token}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`Fetching all test suites for plan ID ${planId}...`);
    
    let allTestSuites = [];
    let skip = 0;
    const top = 100; // Number of suites to fetch per request
    let hasMoreResults = true;
    let page = 1;
    
    // Loop to handle pagination
    while (hasMoreResults) {
      console.log(`Fetching page ${page} of test suites (skip: ${skip}, top: ${top})...`);
      
      // Construct the URL for the API request with pagination parameters
      const url = `${config.orgUrl}/${config.project}/_apis/test/Plans/${planId}/suites?$skip=${skip}&$top=${top}&api-version=7.1`;
      
      // Make the REST API call
      const response = await axiosInstance.get(url);
      
      const suites = response.data.value || [];
      
      if (suites.length > 0) {
        allTestSuites = allTestSuites.concat(suites);
        console.log(`Retrieved ${suites.length} test suites in page ${page}`);
        
        // Prepare for next page
        skip += top;
        page++;
      } else {
        // No more suites to fetch
        hasMoreResults = false;
      }
    }
    
    console.log(`Retrieved a total of ${allTestSuites.length} test suites for plan ID ${planId}`);
    return allTestSuites;
  } catch (error) {
    console.error(`Error fetching test suites for plan ID ${planId}:`, error);
    throw error;
  }
}
