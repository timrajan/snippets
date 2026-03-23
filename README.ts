File.AppendAllText(@"C:\temp\devops_debug.txt", 
    $"{DateTime.Now}: URL=[{url}]{Environment.NewLine}");
// Temporary — just to confirm constructor is being called
    File.AppendAllText(@"C:\temp\devops_debug.txt",
        $"{DateTime.Now}: AzureDevOpsService constructor called. HttpClient null={httpClient == null}{Environment.NewLine}");

public class AzureDevOpsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    // ✅ HttpClient injected here — do NOT new it up anywhere
    public AzureDevOpsService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Message)> TriggerBuildAsync()
    {
        var pat = _configuration["AzureDevOps:Pat"];
        var base64 = Convert.ToBase64String(Encoding.ASCII.GetBytes(":" + pat));

        // ✅ Use the injected _httpClient — never new HttpClient()
        _httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Basic", base64);

        var response = await _httpClient.PostAsync(url, content);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return (false, $"Failed: {response.StatusCode} - {body}");

        return (true, "Build triggered successfully");
    }
}
