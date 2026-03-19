var response = Task.Run(() => _httpClient.PostAsync(url, content)).GetAwaiter().GetResult();
