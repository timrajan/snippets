private HttpClient CreateAdoClient()
{
    var http = _httpFactory.CreateClient("ado");
    http.BaseAddress = new Uri(_org.TrimEnd('/') + "/");
    http.Timeout = TimeSpan.FromSeconds(20);
    http.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", _pat.Trim());
    return http;
}
