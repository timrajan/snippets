var et = _db.Model.FindEntityType(typeof(TestData))!;
foreach (var k in et.GetKeys())
    Console.WriteLine($"{(k.IsPrimaryKey() ? "PK" : "AK")}: {string.Join(",", k.Properties.Select(p => p.Name))}");
