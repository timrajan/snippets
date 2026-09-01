var opts = builder.Configuration.Get<RegionOptions>();
Console.WriteLine($"Bound count: {opts?.Regions?.Count ?? 0}");
Console.WriteLine($"First code: {opts?.Regions?.FirstOrDefault()?.Code}");
