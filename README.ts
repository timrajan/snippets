using Microsoft.AspNetCore.Mvc;
using StudentManagement.Data;

namespace StudentManagement.Controllers
{
    public class HomeController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // Get current Windows username
            var currentUsername = Environment.UserName;

            // Check if this user is a student and get their role
            var student = _context.Students
                .ToList()
                .FirstOrDefault(s => s.Name != null && s.Name.Equals(currentUsername, StringComparison.OrdinalIgnoreCase));

            if (student != null)
            {
                ViewBag.StudentRole = student.Role;
            }

            return View();
        }
    }
}
