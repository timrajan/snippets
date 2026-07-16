const result = {
        gitClient: await connection.getGitApi(),
        witClient: await connection.getWorkItemTrackingApi(),
        testClient: await connection.getTestPlanApi(),
    };
