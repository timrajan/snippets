builder.Services.AddHttpContextAccessor();


private readonly IHttpContextAccessor _httpContextAccessor;

public YourService(IHttpContextAccessor httpContextAccessor)
{
    _httpContextAccessor = httpContextAccessor;
}

public string GetUsername()
{
    var fullName = _httpContextAccessor.HttpContext?.User?.Identity?.Name;
    var username = fullName?.Split('\\').Last() ?? "Guest";
    return username;
}
