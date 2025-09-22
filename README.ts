var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("MyPolicy", policy =>
    {
        policy.WithOrigins("*") // This sets Access-Control-Allow-Origin: *
              .AllowAnyMethod()
              .AllowAnyHeader();
        
        // Or specify exact origins:
        // policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
    });
});

var app = builder.Build();

app.UseCors("MyPolicy");
app.UseRouting();
app.MapControllers();

app.Run();
