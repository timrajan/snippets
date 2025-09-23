public async Task<Build> TriggerBuildAsync(int pipelineId, Dictionary<string, string> parameters)
{
    try
    {
        using var httpClient = new HttpClient();
        
        // Setup authentication
        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($":{_personalAccessToken}"));
        httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authToken);
        httpClient.DefaultRequestHeaders.Accept.Add(
            new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

        // Create the build request payload
        var buildRequest = new
        {
            definition = new { id = pipelineId },
            sourceBranch = "refs/heads/main",
            parameters = JsonConvert.SerializeObject(parameters, new JsonSerializerSettings
            {
                StringEscapeHandling = StringEscapeHandling.Default // Don't escape XML
            })
        };

        _logger.LogInformation("📤 Parameters being sent: {Parameters}", 
            JsonConvert.SerializeObject(parameters, Formatting.Indented));

        // Serialize the request with custom settings to preserve XML
        var jsonContent = JsonConvert.SerializeObject(buildRequest, new JsonSerializerSettings
        {
            StringEscapeHandling = StringEscapeHandling.Default,
            Formatting = Formatting.None
        });

        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Make the API call
        var apiUrl = $"{_organizationUrl.TrimEnd('/')}/{_projectName}/_apis/build/builds?api-version=7.0";
        var response = await httpClient.PostAsync(apiUrl, content);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("❌ Build API call failed. Status: {StatusCode}, Content: {Content}", 
                response.StatusCode, errorContent);
            throw new HttpRequestException($"Build trigger failed: {response.StatusCode} - {errorContent}");
        }

        // Parse the response back to Build object
        var responseContent = await response.Content.ReadAsStringAsync();
        var buildResponse = JsonConvert.DeserializeObject<Build>(responseContent);

        _logger.LogInformation("✅ Build queued successfully. Build ID: {BuildId}", buildResponse.Id);
        return buildResponse;
    }
    catch (HttpRequestException)
    {
        throw; // Re-throw HTTP exceptions as-is
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "❌ Failed to trigger build");
        throw;
    }
}
