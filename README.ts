@{
    ViewData["Title"] = "Access Denied";
}

<div class="text-center mt-5">
    <h2>Access Denied</h2>
    <p>You don't have permission to view this page. Please contact admin.</p>
</div>


Then Views/Shared/AccessDenied.cshtml:



public class HomeController : Controller
{
    private readonly IPermissionService _permissions;

    public HomeController(IPermissionService permissions)
    {
        _permissions = permissions;
    }

    public IActionResult Index()
    {
        // User.Identity.Name gives DOMAIN\username under Windows Auth
        var userId = User.Identity?.Name;

        if (!_permissions.IsAllowed(userId))
        {
            return View("AccessDenied");
        }

        return View();
    }
}
