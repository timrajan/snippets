CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    hire_date DATE,
    salary DECIMAL(10, 2)
);


using Microsoft.AspNetCore.Mvc;
using StudentManagement.Data;
using StudentManagement.Models;
using StudentManagement.Services;

namespace StudentManagement.Controllers
{
    public class StudyRecordController : BaseController
    {
        private readonly ApplicationDbContext _context;
        private readonly AzureDevOpsService _azureDevOpsService;

        public StudyRecordController(ApplicationDbContext context, AzureDevOpsService azureDevOpsService)
        {
            _context = context;
            _azureDevOpsService = azureDevOpsService;
        }

        // Show the main study record page with buttons
        public IActionResult Index()
        {
            return View();
        }

        // Show all study records
        public IActionResult AllRecords()
        {
            var records = _context.StudyRecords.ToList();
            return View(records);
        }

        // GET: Show form to select a student
        [HttpGet]
        public IActionResult SelectStudent()
        {
            var students = _context.Students.ToList();
            ViewBag.Students = students;
            return View();
        }

        // GET: Show form to select a subject type
        [HttpGet]
        public IActionResult SelectSubject()
        {
            // Note: StudyRecord model changed, no longer has Subject field
            ViewBag.Subjects = new List<string>();
            return View();
        }

        // Show study records by subject
        public IActionResult BySubject(string subject)
        {
            // Note: StudyRecord model changed, no longer has Subject field
            var records = new List<StudyRecord>();
            ViewBag.Subject = subject;
            return View(records);
        }

        // Show study records for a specific student
        public IActionResult ByStudent(string firstName)
        {
            var studentRecords = _context.StudyRecords
                .Where(r => r.FirstName.ToLower() == firstName.ToLower())
                .ToList();

            ViewBag.StudentName = firstName;

            return View(studentRecords);
        }

        // GET: Show the form to create a new study record
        [HttpGet]
        public IActionResult Create()
        {
            // Get current user's Windows username
            string username = ViewBag.Username?.ToString() ?? Environment.UserName;

            // Find the TeamAdmin record for this user
            var teamAdmin = _context.TeamAdmins
                .FirstOrDefault(ta => ta.Username.ToLower() == username.ToLower());

            if (teamAdmin != null)
            {
                // Map TeamId to team name (teamA, teamB, teamC)
                var teamName = teamAdmin.TeamId switch
                {
                    1 => "teamA",
                    2 => "teamB",
                    3 => "teamC",
                    _ => "teamA"
                };

                ViewBag.UserTeam = teamName;
            }
            else
            {
                // Default to teamA if user not found
                ViewBag.UserTeam = "teamA";
            }

            return View();
        }

        // POST: Receive the form data and save it
        [HttpPost]
        public IActionResult Create(StudyRecord record)
        {
            // Set the created date
            record.CreatedDate = DateTime.Now;

            // Trigger Azure DevOps Build Pipeline with captured values
            var (success, message) = _azureDevOpsService.TriggerBuildPipeline(record);

            if (success)
            {
                TempData["SuccessMessage"] = message;
            }
            else
            {
                TempData["ErrorMessage"] = message;
            }

            // Add to database
            _context.StudyRecords.Add(record);
            _context.SaveChanges();

            // Redirect to the index page
            return RedirectToAction("Index");
        }

        // GET: Show the View Students page
        [HttpGet]
        public IActionResult ViewStudents()
        {
            // Get current user's Windows username
            string username = ViewBag.Username?.ToString() ?? Environment.UserName;

            // Find the TeamAdmin record for this user
            var teamAdmin = _context.TeamAdmins
                .FirstOrDefault(ta => ta.Username.ToLower() == username.ToLower());

            if (teamAdmin != null)
            {
                // Map TeamId to team name (teamA, teamB, teamC)
                var teamName = teamAdmin.TeamId switch
                {
                    1 => "teamA",
                    2 => "teamB",
                    3 => "teamC",
                    _ => "teamA"
                };

                ViewBag.UserTeam = teamName;
            }
            else
            {
                // Default to teamA if user not found
                ViewBag.UserTeam = "teamA";
            }

            return View();
        }

        // POST: Handle the View button click (for future DB implementation)
        [HttpPost]
        public IActionResult ViewStudents(string filterType, string filterValue)
        {
            // Get current user's team info (same as GET action)
            string username = ViewBag.Username?.ToString() ?? Environment.UserName;
            var teamAdmin = _context.TeamAdmins
                .FirstOrDefault(ta => ta.Username.ToLower() == username.ToLower());

            if (teamAdmin != null)
            {
                var teamName = teamAdmin.TeamId switch
                {
                    1 => "teamA",
                    2 => "teamB",
                    3 => "teamC",
                    _ => "teamA"
                };
                ViewBag.UserTeam = teamName;
            }
            else
            {
                ViewBag.UserTeam = "teamA";
            }

            // This will be implemented when DB is ready
            // For now, just return to the same view
            ViewBag.Message = $"Searching for students by {filterType}: {filterValue}";
            return View();
        }
    }
}
