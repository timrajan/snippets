app.MapGet("/routes", (IEnumerable<EndpointDataSource> sources) =>
    string.Join("\n", sources.SelectMany(s => s.Endpoints).Select(e => e.DisplayName)));
