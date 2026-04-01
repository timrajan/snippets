private async Task<(HttpStatusCode, string)> TriggerReleasePipelineAsync(
    Dictionary<string, string> variables)
{
    var organization = _configuration["AzureDevOps:Organization"];
    var project      = _configuration["AzureDevOps:Project"];
    var pat          = _configuration["AzureDevOps:PAT"];

    var url = $"https://vsrm.dev.azure.com/{organization}/{project}/_apis/release/releases?api-version=7.0";

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

    var json    = JsonSerializer.Serialize(body);
    var content = new StringContent(json, Encoding.UTF8, "application/json");

    var token = Convert.ToBase64String(Encoding.ASCII.GetBytes($":{pat}"));

    using var request = new HttpRequestMessage(HttpMethod.Post, url);
    request.Headers.Authorization = new AuthenticationHeaderValue("Basic", token);
    request.Content = content;

    var response     = await _httpClient.SendAsync(request);
    var responseBody = await response.Content.ReadAsStringAsync();

    if (!response.IsSuccessStatusCode)
    {
        _logger.LogError(
            "Release pipeline trigger failed. Status: {Status} | Response: {Body}",
            response.StatusCode, responseBody);

        return (response.StatusCode, $"Release pipeline trigger failed: {responseBody}");
    }

    _logger.LogInformation("Release pipeline triggered successfully. Status: {Status}", response.StatusCode);
    return (response.StatusCode, responseBody);
}
