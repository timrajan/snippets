using Microsoft.AspNetCore.Mvc;
using StudentManagement.Data;
using StudentManagement.Models;

namespace StudentManagement.Controllers
{
    public class StudentController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public StudentController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var students = _context.Students.ToList();
            return View(students);
        }

        // NEW: Show students grouped by team
        public IActionResult ByTeam()
        {
            // We'll pass BOTH students and teams to the view
            // For now, just pass students
            var students = _context.Students.ToList();
            return View(students);
        }

        // GET: Show form to create a new student
        [HttpGet]
        public IActionResult Create()
        {
            // Pass list of teams so Team Admin can select which team
            // (Later, we'll restrict this to only THEIR team)
            var teams = _context.Teams.ToList();
            ViewBag.Teams = teams;
            return View();
        }

        // POST: Receive form data and create the student
        [HttpPost]
        public IActionResult Create(Student student)
        {
            // Validate the data
            if (string.IsNullOrEmpty(student.Name) ||
                string.IsNullOrEmpty(student.Email) ||
                student.TeamId == 0)
            {
                ViewBag.Error = "Name, Email, and Team are required fields.";
                ViewBag.Teams = _context.Teams.ToList();
                return View(student);
            }

            // Set the enrollment date
            student.EnrollmentDate = DateTime.Now;

            // Add to database
            _context.Students.Add(student);
            _context.SaveChanges();

            // Get the team name for the success message
            var team = _context.Teams.FirstOrDefault(t => t.Id == student.TeamId);

            // Show success message
            TempData["SuccessMessage"] = $"Student '{student.Name}' has been added to {team?.Name}!";

            // Redirect to the students list
            return RedirectToAction("Index");
        }
    }
}
