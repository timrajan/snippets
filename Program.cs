var username = User?.Identity?.IsAuthenticated == true
    ? User.Identity.Name?.Split('\\').Last()
    : Environment.UserName; // fallback for dev if auth not set up
