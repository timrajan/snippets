const result = {
        gitClient: await connection.getGitApi(),
        witClient: await connection.getWorkItemTrackingApi(),
        testClient: await connection.getTestPlanApi(),
    };


interface AdoClients {
    gitClient: IGitApi;
    witClient: IWorkItemTrackingApi;
    testClient: ITestPlanApi;
}

async function getAdoClients(connection: WebApi): Promise<AdoClients> {
