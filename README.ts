{
  "ConnectionStrings": {
    "ProductionConnection": "Host=myserver;Port=5432;Database=myapp_prod;Username=appuser;Password=xxx",
    "StagingConnection": "Host=myserver;Port=5432;Database=myapp_staging;Username=appuser;Password=xxx"
  }
}


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Order> Orders { get; set; }
    public DbSet<Customer> Customers { get; set; }
    // ... all your entities
}

public class StagingDbContext : AppDbContext
{
    public StagingDbContext(DbContextOptions<StagingDbContext> options)
        : base(options) { }
}

