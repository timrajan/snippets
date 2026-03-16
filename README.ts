// Add this
builder.Services.AddAuthentication(IISDefaults.AuthenticationScheme);

// You already have this most likely
builder.Services.AddControllersWithViews();

And make sure this using is at the top:
csharpusing Microsoft.AspNetCore.Server.IISIntegration;


var isAuth = User?.Identity?.IsAuthenticated;
    var name = User?.Identity?.Name;
    
    // Breakpoint here and check these values
    Console.WriteLine($"IsAuthenticated: {isAuth}");
    Console.WriteLine($"Name: {name}");
