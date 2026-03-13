      // Serialize to JSON
      var json = JsonSerializer.Serialize(payload);
      var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
      var response = httpClient.PostAsync(url, content).GetAwaiter().GetResult();
