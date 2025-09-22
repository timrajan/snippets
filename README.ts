<PackageReference Include="Microsoft.TeamFoundation.DistributedTask.WebApi" Version="19.225.1" />
<PackageReference Include="Microsoft.VisualStudio.Services.Client" Version="19.225.1" />

// Add this line to your existing service registrations
builder.Services.AddScoped<IAzureDevOpsBuildService, AzureDevOpsBuildService>();


 // Services/AzureDevOpsBuildService.cs
using Microsoft.TeamFoundation.Build.WebApi;
using Microsoft.VisualStudio.Services.Common;
using Microsoft.VisualStudio.Services.WebApi;

public interface IAzureDevOpsBuildService
{
    Task<Build> TriggerBuildAsync(int pipelineId, Dictionary<string, string> parameters);
}

public class AzureDevOpsBuildService : IAzureDevOpsBuildService
{
    private readonly string _organizationUrl;
    private readonly string _personalAccessToken;
    private readonly string _projectName;
    private readonly ILogger<AzureDevOpsBuildService> _logger;

    public AzureDevOpsBuildService(IConfiguration configuration, ILogger<AzureDevOpsBuildService> logger)
    {
        _organizationUrl = configuration["AzureDevOps:OrganizationUrl"];
        _personalAccessToken = configuration["AzureDevOps:PersonalAccessToken"];
        _projectName = configuration["AzureDevOps:ProjectName"];
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
}
