string.Join(" | ", _db.ChangeTracker.Entries<TestData>().Select(e => e.Entity.Id + ":" + e.Entity.TestId + ":" + e.State))

string.Join(",", _db.Model.FindEntityType(typeof(TestData)).GetKeys().Single().Properties.Select(p => p.Name))
