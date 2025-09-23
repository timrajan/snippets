var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<YourDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();

// Configure CORS to handle preflight requests
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",     // React default
                "http://localhost:4200",     // Angular default
                "http://localhost:8080",     // Vue default
                "https://yourdomain.com"     // Your production domain
              )
              .AllowAnyMethod()              // Allows GET, POST, PUT, DELETE, OPTIONS
              .AllowAnyHeader()              // Allows any headers
              .AllowCredentials()            // If you need cookies/auth
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10)); // Cache preflight for 10 minutes
    });
});

var app = builder.Build();

// IMPORTANT: CORS must be placed in the correct order
app.UseCors("AllowFrontend");

// Other middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
