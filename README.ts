public class MyDbContext : DbContext
{
    private readonly string _connectionString;

    public MyDbContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_connectionString);
    }

    public DbSet<MyEntity> MyEntities { get; set; }
}


var connectionString = "Host=localhost;Port=5432;Database=mydb;Username=myuser;Password=mypass";
using var _dbContext = new MyDbContext(connectionString);
