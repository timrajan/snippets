var username = User?.Identity?.IsAuthenticated == true
    ? User.Identity.Name?.Split('\\').Last()
    : Environment.UserName; // fallback for dev if auth not set up
@using System.Linq

@{
    var username = User?.Identity?.IsAuthenticated == true
        ? User.Identity.Name?.Split('\\').Last()
        : Environment.UserName;
}

<!-- Then use it anywhere in the HTML -->
<p>Welcome, @username</p>
