// ❌ Before
public void TriggerBuild()
{
    var response = Task.Run(() => _httpClient.PostAsync(url, content))
                       .GetAwaiter().GetResult();
}

// ✅ After
public async Task TriggerBuildAsync()
{
    var response = await _httpClient.PostAsync(url, content);
    var body = await response.Content.ReadAsStringAsync();
    
    if (!response.IsSuccessStatusCode)
        throw new Exception($"DevOps returned {response.StatusCode}: {body}");
}




// ❌ Before
public IActionResult RunBuild()
{
    _service.TriggerBuild();
    return Ok();
}

// ✅ After
public async Task<IActionResult> RunBuild()
{
    await _service.TriggerBuildAsync();
    return Ok();
}
```

---

## The Rule
```
Controller (async Task<IActionResult>)
    ↓ await
Service method (async Task)
    ↓ await
HttpClient.PostAsync()


Every single level must be async/await. No .Result, no .Wait(), no .GetAwaiter().GetResult(), no Task.Run wrapper — anywhere in the chain.
