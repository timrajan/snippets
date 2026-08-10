string.Join(" | ", _db.ChangeTracker.Entries<TestData>().Select(e => e.Entity.Id + ":" + e.Entity.TestId + ":" + e.State))
