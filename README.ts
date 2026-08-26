app.MapGet("/routes", (IEnumerable<EndpointDataSource> sources) =>
    string.Join("\n", sources.SelectMany(s => s.Endpoints)
        .OfType<RouteEndpoint>()
        .Select(e => e.RoutePattern.RawText)));
