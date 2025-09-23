System.Collections.Generic.Dictionary`2[System.String,System.String]

foreach (KeyValuePair<string, string> item in myDict)
{
    Console.WriteLine($"Key: {item.Key}, Value: {item.Value}");
}


public interface IAzureDevOpsBuildService
{
    Task<Build> TriggerBuildAsync(int pipelineId, Dictionary<string, string> parameters);
    Task<Build> TriggerBuildAndWaitAsync(int pipelineId, Dictionary<string, string> parameters, int timeoutMinutes = 30);
    Task<Build> GetBuildStatusAsync(int buildId);
}

public class AzureDevOpsBuildService : IAzureDevOpsBuildService
{
    private readonly string _organizationUrl = "https://dev.azure.com/myorg";
    private readonly string _personalAccessToken = "your-pat-token";
    private readonly string _projectName = "your-project";
    private readonly ILogger<AzureDevOpsBuildService> _logger;

    public AzureDevOpsBuildService(ILogger<AzureDevOpsBuildService> logger)
    {
        _logger = logger;
    }

    public async Task<Build> TriggerBuildAsync(int pipelineId, Dictionary<string, string> parameters)
    {
        try
        {
            _logger.LogInformation("Triggering build for pipeline {PipelineId}", pipelineId);

            var credentials = new VssBasicCredential(string.Empty, _personalAccessToken);
            var connection = new VssConnection(new Uri(_organizationUrl), credentials);
            
            await connection.ConnectAsync();
            var buildClient = connection.GetClient<BuildHttpClient>();

            var buildDefinition = new DefinitionReference { Id = pipelineId };
            var build = new Build
            {
                Definition = buildDefinition,
                SourceBranch = "refs/heads/main",
                Parameters = Newtonsoft.Json.JsonConvert.SerializeObject(parameters)
            };

            var queuedBuild = await buildClient.QueueBuildAsync(build, _projectName);
            
            _logger.LogInformation("Build queued successfully. Build ID: {BuildId}", queuedBuild.Id);
            return queuedBuild;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to trigger build for pipeline {PipelineId}", pipelineId);
            throw;
        }
    }

    public async Task<Build> TriggerBuildAndWaitAsync(int pipelineId, Dictionary<string, string> parameters, int timeoutMinutes = 30)
    {
        // First trigger the build
        var build = await TriggerBuildAsync(pipelineId, parameters);
        
        // Then wait for completion
        return await WaitForBuildCompletionAsync(build.Id, timeoutMinutes);
    }

    public async Task<Build> GetBuildStatusAsync(int buildId)
    {
        var credentials = new VssBasicCredential(string.Empty, _personalAccessToken);
        var connection = new VssConnection(new Uri(_organizationUrl), credentials);
        var buildClient = connection.GetClient<BuildHttpClient>();
        
        return await buildClient.GetBuildAsync(_projectName, buildId);
    }

    private async Task<Build> WaitForBuildCompletionAsync(int buildId, int timeoutMinutes)
    {
        var credentials = new VssBasicCredential(string.Empty, _personalAccessToken);
        var connection = new VssConnection(new Uri(_organizationUrl), credentials);
        var buildClient = connection.GetClient<BuildHttpClient>();
        
        var timeout = DateTime.UtcNow.AddMinutes(timeoutMinutes);
        var checkInterval = TimeSpan.FromSeconds(15); // Check every 15 seconds
        
        _logger.LogInformation("Waiting for build {BuildId} to complete (timeout: {TimeoutMinutes} minutes)", buildId, timeoutMinutes);
        
        while (DateTime.UtcNow < timeout)
        {
            var currentBuild = await buildClient.GetBuildAsync(_projectName, buildId);
            
            _logger.LogInformation("Build {BuildId} status: {Status}", buildId, currentBuild.Status);
            
            if (currentBuild.Status == BuildStatus.Completed)
            {
                _logger.LogInformation("✅ Build {BuildId} completed with result: {Result}", 
                    buildId, currentBuild.Result);
                return currentBuild;
            }
            
            if (currentBuild.Status == BuildStatus.Cancelling || currentBuild.Status == BuildStatus.Postponed)
            {
                _logger.LogWarning("Build {BuildId} was cancelled or postponed", buildId);
                return currentBuild;
            }
            
            await Task.Delay(checkInterval);
        }
        
        throw new TimeoutException($"Build {buildId} did not complete within {timeoutMinutes} minutes");
    }
}
