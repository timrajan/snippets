The LINQ expression 'DbSet<Member>()
    .Where(t => t.Id.Equals(
        value: __username_0, 
        comparisonType: OrdinalIgnoreCase))' could not be translated. Additional information: Translation of the 'string.Equals' overload with a 'StringComparison' parameter is not supported. See https://go.microsoft.com/fwlink/?linkid=2129535 for more information. Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting a call to 'AsEnumerable', 'AsAsyncEnumerable', 'ToList', or 'ToListAsync'. See https://go.microsoft.com/fwlink/?linkid=2101038 for more information.

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
