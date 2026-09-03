 private async Task<(bool ok, string status, string? result)>
     GetBuildStatus(HttpClient http, int runId, CancellationToken ct)
 {
     try
     {
         // ✓ Fixed URL construction
         var url = $"{_project}/_apis/build/builds/{runId}?api-version=7.1";
         using var resp = await http.GetAsync(url, ct);

         if (!resp.IsSuccessStatusCode)
         {
             _logger.LogWarning("ADO returned {code} for run {id}", (int)resp.StatusCode, runId);
             return (false, "", null);
         }

         await using var stream = await resp.Content.ReadAsStreamAsync(ct);
         using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
         var root = doc.RootElement;

         return (
             true,
             root.GetProperty("status").GetString() ?? "",
             root.TryGetProperty("result", out var r) ? r.GetString() : null
         );
     }
     catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
     catch (Exception ex)
     {
         _logger.LogWarning(ex, "Error polling run {id}", runId);
         return (false, "", null);
     }
 }
