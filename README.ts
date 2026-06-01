 const points: TestPoint[] = (
        await testApi.getPoints(
            testProject,
            testPlanID,
            targetTestSuiteID,
            undefined,
            testConfig ? testConfig.id.toString() : undefined,
            testCaseID.toString()
        )
    ).filter((point) => {       
        return point.testCase.id === testCaseID.toString();
    });

 Cannot read properties of null (reading 'filter')
