var templateParameters = new Dictionary<string, string>
{
    { "myParam1", "value1" },
    { "myParam2", "value2" }
    // all your existing params here
};

var requestBody = new { templateParameters };

var json = JsonSerializer.Serialize(requestBody);
var content = new StringContent(json, Encoding.UTF8, "application/json");

httpClient.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Bearer", pat);

var response = await httpClient.PostAsync(
    $"https://dev.azure.com/{org}/{project}/_apis/pipelines/{pipelineId}/runs?api-version=7.1",
    content
);
