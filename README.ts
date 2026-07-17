modelBuilder.Entity<TestData>()
    .Property(t => t.Id)
    .ValueGeneratedOnAdd();   // or .UseIdentityByDefaultColumn() with Npgsql
