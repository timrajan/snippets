// temporary diagnostic
var check = builder.Configuration.GetSection("Regions").Get<List<RegionItem>>();
Console.WriteLine($"Loaded {check?.Count ?? 0} regions");
