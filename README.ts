var path = Path.Combine(builder.Environment.ContentRootPath, "stateaus.json");
Console.WriteLine($"Exists: {File.Exists(path)}");
Console.WriteLine(File.ReadAllText(path));
