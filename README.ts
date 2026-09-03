private async Task<(bool ok, string status, string? result)>
    GetReleaseStatus(HttpClient http, int releaseId, CancellationToken ct)
{
    try
    {
        var url = $"{_project}/_apis/release/releases/{releaseId}?api-version=7.1";
        using var resp = await http.GetAsync(url, ct);
        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("ADO returned {code} for release {id}", (int)resp.StatusCode, releaseId);
            return (false, "", null);
        }
        await using var stream = await resp.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        var env = doc.RootElement.GetProperty("environments")[0];
        return (true, env.GetProperty("status").GetString() ?? "", null);
    }
    catch (OperationCanceledException) when (ct.IsCancellationRequested) { throw; }
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Error polling release {id}", releaseId);
        return (false, "", null);
    }
}

Two changes from your build version: the URL path, and reading environments[0].status instead of the root. Pass it an HttpClient whose BaseAddress is https://vsrm.dev.azure.com/{org}/.

The status values you'll get back are notStarted, inProgress, succeeded, partiallySucceeded, rejected, canceled — so your polling loop needs to check those rather than build's completed/succeeded. This reads the first stage only; if the release has several, tell me and I'll adjust which one it picks.
