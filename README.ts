import * as azdev from "azure-devops-node-api";

async function getTestCaseSteps(organizationUrl, testCaseId, personalAccessToken) {
    try {
        // Create connection
        const authHandler = azdev.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new azdev.WebApi(organizationUrl, authHandler);
        
        // Get work item tracking client
        const witClient = await connection.getWorkItemTrackingApi();
        
        // Get the test case with expanded relations and fields
        const testCase = await witClient.getWorkItem(
            testCaseId,
            null, // fields (null gets all fields)
            null, // asOf date
            azdev.WorkItemExpand.All // expand all relations and fields
        );
        
        // Extract test steps from the work item
        const testSteps = extractTestSteps(testCase);
        
        return testSteps;
        
    } catch (error) {
        console.error('Error retrieving test case steps:', error);
        throw error;
    }
}

function extractTestSteps(workItem) {
    const steps = [];
    
    // Test steps are stored in the Microsoft.VSTS.TCM.Steps field
    const stepsField = workItem.fields?.['Microsoft.VSTS.TCM.Steps'];
    
    if (stepsField) {
        // Parse the XML-like structure that contains the test steps
        const stepsXml = stepsField;
        
        // You might need to parse XML here depending on the format
        // The steps are typically stored as XML with step elements
        
        // Example parsing (you may need to adjust based on actual format):
        const stepMatches = stepsXml.match(/<step[^>]*>(.*?)<\/step>/gs);
        
        if (stepMatches) {
            stepMatches.forEach((stepMatch, index) => {
                // Extract action and expected result
                const actionMatch = stepMatch.match(/<parameterizedString[^>]*isformatted="true"[^>]*>(.*?)<\/parameterizedString>/s);
                const expectedMatch = stepMatch.match(/<parameterizedString[^>]*isformatted="true"[^>]*>(.*?)<\/parameterizedString>/gs);
                
                const action = actionMatch ? actionMatch[1].trim() : '';
                const expected = expectedMatch && expectedMatch[1] ? expectedMatch[1][1].trim() : '';
                
                steps.push({
                    stepNumber: index + 1,
                    action: action,
                    expectedResult: expected
                });
            });
        }
    }
    
    return steps;
}

// Usage example
async function example() {
    const organizationUrl = 'https://dev.azure.com/yourorganization';
    const testCaseId = 12345;
    const pat = 'your-personal-access-token';
    
    try {
        const steps = await getTestCaseSteps(organizationUrl, testCaseId, pat);
        console.log('Test Case Steps:', steps);
    } catch (error) {
        console.error('Failed to get test case steps:', error);
    }
}
