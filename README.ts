public class BaseController : Controller
{
    // Property to access username in any derived controller
    public string CurrentUsername
    {
        get
        {
            var fullName = User.Identity?.Name;
            if (string.IsNullOrEmpty(fullName))
                return "Guest";
            
            // Remove domain prefix (DOMAIN\username -> username)
            var username = fullName.Split('\\').Last();
            return username;
        }
    }

    // Or use this in OnActionExecuting to make it available in all views
    protected override void OnActionExecuting(ActionExecutingContext context)
    {
        base.OnActionExecuting(context);
        
        var username = User.Identity?.Name?.Split('\\').Last() ?? "Guest";
        ViewBag.Username = username;
        // Or use ViewData
        // ViewData["Username"] = username;
    }
}
