 var url = $"{Uri.EscapeDataString(_project)}/_apis/build/builds/{runId}?api-version=7.1";
 using var resp = await http.GetAsync(url, ct);

 if (!resp.IsSuccessStatusCode)
 {
     _logger.LogWarning("ADO returned {code} for run {id}", (int)resp.StatusCode, runId);
     return (false, "", null);
 }
