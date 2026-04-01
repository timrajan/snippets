private async Task<(HttpStatusCode, string)> TriggerReleasePipelineAsync(
        Dictionary<string, string> variables,
        CancellationToken cancellationToken)
    {
        var organization = _configuration["AzureDevOps:Organization"];
        var project      = _configuration["AzureDevOps:Project"];

        var url = $"https://vsrm.dev.azure.com/{organization}/{project}" +
                  $"/_apis/release/releases?api-version=7.0";

        var body = new
        {
            definitionId = ReleaseDefinitionId,
            description  = $"Triggered via API — record_type: {variables.GetValueOrDefault("record_type")}",
            isDraft      = false,
            variables    = variables.ToDictionary(
                               kvp => kvp.Key,
                               kvp => new { value = kvp.Value }
                           )
        };

        return await PostAsync(url, body, cancellationToken);
    }
