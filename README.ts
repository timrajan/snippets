 var httpClient = new HttpClient();
 httpClient.BaseAddress= new Uri(_org);
 httpClient.DefaultRequestHeaders.Authorization =
     new AuthenticationHeaderValue("Bearer", _pat.Trim());



var url = $"{Uri.EscapeDataString(_project)}/_apis/build/builds/{runId}?api-version=7.1";
 using var resp = await http.GetAsync(url, ct);

 if (!resp.IsSuccessStatusCode)
 {
     _logger.LogWarning("ADO returned {code} for run {id}", (int)resp.StatusCode, runId);
     return (false, "", null);
 }
