async function getSharedStepNames(organizationUrl, testCaseId, personalAccessToken) {
    try {
        const authHandler = azdev.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new azdev.WebApi(organizationUrl, authHandler);
        const witClient = await connection.getWorkItemTrackingApi();
        
        const testCase = await witClient.getWorkItem(testCaseId, null, null, azdev.WorkItemExpand.All);
        const stepsField = testCase.fields?.['Microsoft.VSTS.TCM.Steps'];
        
        const sharedStepInfo = [];
        
        if (stepsField) {
            const comprefPattern = /<compref[^>]*ref="(\d+)"[^>]*>/g;
            let match;
            let sharedStepNumber = 1; // Start counting from 1
            
            while ((match = comprefPattern.exec(stepsField)) !== null) {
                const sharedStepId = parseInt(match[1]);
                
                try {
                    const sharedStep = await witClient.getWorkItem(sharedStepId);
                    const sharedStepName = sharedStep.fields?.['System.Title'];
                    
                    sharedStepInfo.push({
                        sharedStepNumber: sharedStepNumber,
                        sharedStepId: sharedStepId,
                        sharedStepName: sharedStepName
                    });
                } catch (error) {
                    console.warn(`Could not retrieve shared step ${sharedStepId}:`, error.message);
                    sharedStepInfo.push({
                        sharedStepNumber: sharedStepNumber,
                        sharedStepId: sharedStepId,
                        sharedStepName: `Unknown Shared Step (ID: ${sharedStepId})`
                    });
                }
                
                sharedStepNumber++; // Increment for next shared step
            }
        }
        
        return sharedStepInfo;
        
    } catch (error) {
        console.error('Error getting shared step names:', error);
        throw error;
    }
}
