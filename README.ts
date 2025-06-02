const testCaseDetails = {
            id: testCase.id,
            title: testCase.fields?.['System.Title'], // Test case title
            // The "name" is typically the same as title in Azure DevOps
            name: testCase.fields?.['System.Title'], 
            // Additional useful fields
            workItemType: testCase.fields?.['System.WorkItemType'],
            state: testCase.fields?.['System.State'],
            assignedTo: testCase.fields?.['System.AssignedTo']?.displayName,
            areaPath: testCase.fields?.['System.AreaPath'],
            iterationPath: testCase.fields?.['System.IterationPath'],
            priority: testCase.fields?.['Microsoft.VSTS.Common.Priority'],
            automationStatus: testCase.fields?.['Microsoft.VSTS.TCM.AutomationStatus']
        };
