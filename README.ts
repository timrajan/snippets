using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Services;

namespace StudentManagement.Controllers
{
    public class StudyRecordController : BaseController
    {
        private readonly DataService _dataService;
        private readonly AzureDevOpsService _azureDevOpsService;

        public StudyRecordController(DataService dataService, AzureDevOpsService azureDevOpsService)
        {
            _dataService = dataService;
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
            return View(_dataService.StudyRecords);
        }

        // GET: Show form to select a student
        [HttpGet]
        public IActionResult SelectStudent()
        {
            ViewBag.Students = _dataService.Students;
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
            var studentRecords = _dataService.StudyRecords
                .Where(r => r.FirstName.Equals(firstName, StringComparison.OrdinalIgnoreCase))
                .ToList();

            ViewBag.StudentName = firstName;

            return View(studentRecords);
        }

        // GET: Show the form to create a new study record
        [HttpGet]
        public IActionResult Create()
        {
            // Get current user's Windows username
            var username = ViewBag.Username?.ToString() ?? Environment.UserName;

            // Find the TeamAdmin record for this user
            var teamAdmin = _dataService.Users.FirstOrDefault(ta =>
                ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

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
            // Generate a new ID
            record.Id = _dataService.StudyRecords.Count > 0
                ? _dataService.StudyRecords.Max(r => r.Id) + 1
                : 1;

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

            // Add to our list
            _dataService.StudyRecords.Add(record);

            // Redirect to the index page
            return RedirectToAction("Index");
        }

        // GET: Show the View Students page
        [HttpGet]
        public IActionResult ViewStudents()
        {
            // Get current user's Windows username
            var username = ViewBag.Username?.ToString() ?? Environment.UserName;

            // Find the TeamAdmin record for this user
            var teamAdmin = _dataService.Users.FirstOrDefault(ta =>
                ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

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
            var username = ViewBag.Username?.ToString() ?? Environment.UserName;
            var teamAdmin = _dataService.Users.FirstOrDefault(ta =>
                ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

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
