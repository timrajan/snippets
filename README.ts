using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using StudentManagement.Data;

namespace StudentManagement.Controllers
{
    public class BaseController : Controller
    {
        protected readonly ApplicationDbContext _context;

        public BaseController(ApplicationDbContext context)
        {
            _context = context;
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            base.OnActionExecuting(context);

            // Get Windows username and set role for all pages
            var windowsUsername = Environment.UserName;
            var role = GetUserRoleFromDatabase(windowsUsername);
            ViewBag.Role = role;
            ViewBag.Username = windowsUsername;
        }

        private string GetUserRoleFromDatabase(string username)
        {
            try
            {
                // Query the TeamAdmins table to find the user by username
                var teamMember = _context.TeamAdmins
                    .FirstOrDefault(ta => ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

                if (teamMember != null)
                {
                    return teamMember.Role ?? "TeamAdmin";
                }
            }
            catch (Exception)
            {
                // If any error, default to TeamAdmin
            }

            return "TeamAdmin";
        }
    }
}
