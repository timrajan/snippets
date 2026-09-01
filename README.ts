foreach (var kvp in builder.Configuration.AsEnumerable()
                           .Where(k => k.Key.StartsWith("Regions"))
                           .OrderBy(k => k.Key))
    Console.WriteLine($"{kvp.Key} = {kvp.Value}");
