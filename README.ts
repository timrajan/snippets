using Microsoft.TeamFoundation.Build.WebApi;
using Microsoft.VisualStudio.Services.Common;

public class AzureDevOpsService
{
    private readonly IConfiguration _configuration;

    public AzureDevOpsService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<(bool Success, string Message)> TriggerBuildAsync(Dictionary<string, string> parameters)
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
                    Definition = new DefinitionReference { Id = pipelineId },
                    Parameters = System.Text.Json.JsonSerializer.Serialize(parameters)
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
