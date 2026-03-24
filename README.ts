<PackageReference Include="System.Configuration.ConfigurationManager" Version="8.0.0" />

Microsoft.TeamFoundationServer.Client
Microsoft.VisualStudio.Services.Client

using Microsoft.TeamFoundation.Build.WebApi;
using Microsoft.VisualStudio.Services.Common;
using Microsoft.VisualStudio.Services.Client;

public class AzureDevOpsService
{
    private readonly IConfiguration _configuration;

    public AzureDevOpsService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<(bool Success, string Message)> TriggerBuildAsync()
    {
        try
        {
            var pat = _configuration["AzureDevOps:Pat"];
            var orgUrl = _configuration["AzureDevOps:OrgUrl"];
            var project = _configuration["AzureDevOps:Project"];
            var pipelineId = int.Parse(_configuration["AzureDevOps:PipelineId"]);

            var credentials = new VssBasicCredential(string.Empty, pat);
            var connection = new VssConnection(new Uri(orgUrl), credentials);

            var buildClient = connection.GetClient<BuildHttpClient>();
            var build = await buildClient.QueueBuildAsync(
                new Build
                {
                    Definition = new DefinitionReference { Id = pipelineId }
                },
                project);

            return (true, $"Build triggered. Build ID={build.Id}");
        }
        catch (Exception ex)
        {
            return (false, $"Error: {ex.Message}");
        }
    }
}



{
  "AzureDevOps": {
    "OrgUrl": "https://dev.azure.com/yourorg",
    "Project": "yourproject",
    "PipelineId": "42",
    "Pat": "your-pat-here"
  }
}

// Remove this entire block
builder.Services.AddHttpClient<AzureDevOpsService>()
    .ConfigurePrimaryHttpMessageHandler(() => ...);

// Replace with this
builder.Services.AddScoped<AzureDevOpsService>();
