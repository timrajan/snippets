public async Task<Build> TriggerBuildAsync(int pipelineId, Dictionary<string, string> parameters)
{
    try
    {
        using var httpClient = new HttpClient();
        
        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($":{_personalAccessToken}"));
        httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authToken);
        httpClient.DefaultRequestHeaders.Accept.Add(
            new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

        // IMPORTANT: Parameters need to be double-serialized as a JSON string
        var parametersJsonString = JsonConvert.SerializeObject(parameters, new JsonSerializerSettings
        {
            StringEscapeHandling = StringEscapeHandling.Default
        });

        var buildRequest = new
        {
            definition = new { id = pipelineId },
            sourceBranch = "refs/heads/main",
            parameters = parametersJsonString // This should be a JSON string, not an object
        };

        _logger.LogInformation("📤 Parameters JSON string: {ParametersJson}", parametersJsonString);

        var jsonContent = JsonConvert.SerializeObject(buildRequest);
        _logger.LogInformation("📤 Full request JSON: {RequestJson}", jsonContent);

        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        var apiUrl = $"{_organizationUrl.TrimEnd('/')}/{_projectName}/_apis/build/builds?api-version=7.0";
        
        var response = await httpClient.PostAsync(apiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("❌ Build API call failed. Status: {StatusCode}, Content: {Content}", 
                response.StatusCode, errorContent);
            throw new HttpRequestException($"Build trigger failed: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var buildResponse = JsonConvert.DeserializeObject<Build>(responseContent);

        _logger.LogInformation("✅ Build queued successfully. Build ID: {BuildId}", buildResponse.Id);
        return buildResponse;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Failed to trigger build");
        throw;
    }
}
