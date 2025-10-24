var connectionString = _configuration.GetConnectionString("DefaultConnection");

// In Program.cs (for .NET 6+)
var builder = WebApplication.CreateBuilder(args);

// Configuration is automatically loaded, but you can verify:
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
