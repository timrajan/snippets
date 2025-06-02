const stepId = stepIdMatch ? parseInt(stepIdMatch[1]) : null;
stepId: stepId,


import * as xml2js from 'xml2js';

async function extractTestStepsWithXmlParser(workItem) {
    const steps = [];
    
    const stepsField = workItem.fields?.['Microsoft.VSTS.TCM.Steps'];
    
    if (stepsField) {
        try {
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(stepsField);
            
            // Navigate through the XML structure
            const stepElements = result?.steps?.step;
            
            if (stepElements && Array.isArray(stepElements)) {
                stepElements.forEach((step, index) => {
                    const stepId = step.$.id ? parseInt(step.$.id) : null;
                    
                    // Extract action and expected result from parameterizedString elements
                    let action = '';
                    let expectedResult = '';
                    
                    if (step.parameterizedString && Array.isArray(step.parameterizedString)) {
                        if (step.parameterizedString[0] && step.parameterizedString[0]._) {
                            action = step.parameterizedString[0]._.trim();
                        }
                        if (step.parameterizedString[1] && step.parameterizedString[1]._) {
                            expectedResult = step.parameterizedString[1]._.trim();
                        }
                    }
                    
                    steps.push({
                        stepId: stepId,
                        stepNumber: index + 1,
                        action: action,
                        expectedResult: expectedResult
                    });
                });
            }
        } catch (error) {
            console.error('Error parsing test steps XML:', error);
            // Fallback to regex parsing if XML parsing fails
            return extractTestStepsWithRegex(workItem);
        }
    }
    
    return steps;
}

// Alternative regex-based extraction (more reliable for malformed XML)
function extractTestStepsWithRegex(workItem) {
    const steps = [];
    const stepsField = workItem.fields?.['Microsoft.VSTS.TCM.Steps'];
    
    if (stepsField) {
        // More comprehensive regex to capture step ID and content
        const stepPattern = /<step\s+id="(\d+)"[^>]*>(.*?)<\/step>/gs;
        let match;
        
        while ((match = stepPattern.exec(stepsField)) !== null) {
            const stepId = parseInt(match[1]);
            const stepContent = match[2];
            
            // Extract parameterized strings from step content
            const paramStrings = stepContent.match(/<parameterizedString[^>]*isformatted="true"[^>]*>(.*?)<\/parameterizedString>/gs);
            
            let action = '';
            let expectedResult = '';
            
            if (paramStrings) {
                // Clean up the first parameterized string (action)
                if (paramStrings[0]) {
                    action = paramStrings[0]
                        .replace(/<parameterizedString[^>]*isformatted="true"[^>]*>/, '')
                        .replace(/<\/parameterizedString>/, '')
                        .trim();
                }
                
                // Clean up the second parameterized string (expected result)
                if (paramStrings[1]) {
                    expectedResult = paramStrings[1]
                        .replace(/<parameterizedString[^>]*isformatted="true"[^>]*>/, '')
                        .replace(/<\/parameterizedString>/, '')
                        .trim();
                }
            }
            
            steps.push({
                stepId: stepId,
                stepNumber: steps.length + 1,
                action: action,
                expectedResult: expectedResult
            });
        }
    }
    
    return steps;
}
    


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
