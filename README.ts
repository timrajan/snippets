public async Task<Build> TriggerBuildAsync(int pipelineId, Dictionary<string, string> parameters)
{
    try
    {
        var credentials = new VssBasicCredential(string.Empty, _personalAccessToken);
        var connection = new VssConnection(new Uri(_organizationUrl), credentials);
        
        await connection.ConnectAsync();
        var buildClient = connection.GetClient<BuildHttpClient>();

        var buildDefinition = new DefinitionReference { Id = pipelineId };
        
        // For Classic Pipelines, use Variables instead of Parameters
        var buildVariables = new Dictionary<string, BuildDefinitionVariable>();
        foreach (var param in parameters)
        {
            buildVariables.Add(param.Key, new BuildDefinitionVariable 
            { 
                Value = param.Value,
                AllowOverride = true 
            });
        }

        var build = new Build
        {
            Definition = buildDefinition,
            SourceBranch = "refs/heads/main",
            Parameters = JsonConvert.SerializeObject(parameters), // Still try parameters
            // Variables = buildVariables // Try this for classic pipelines
        };

        _logger.LogInformation("📤 Variables being sent: {Variables}", 
            JsonConvert.SerializeObject(buildVariables, Formatting.Indented));

        var queuedBuild = await buildClient.QueueBuildAsync(build, _projectName);
        
        _logger.LogInformation("✅ Build queued successfully. Build ID: {BuildId}", queuedBuild.Id);
        return queuedBuild;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Failed to trigger build", ex);
        throw;
    }
}
