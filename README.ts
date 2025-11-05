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
                .ToList()
                .Where(r => r.FirstName != null && r.FirstName.Equals(firstName, StringComparison.OrdinalIgnoreCase))
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

            // Find the TeamAdmin record for this user - Load to memory first, then filter
            var teamAdmin = _context.TeamAdmins
                .ToList()
                .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

            if (teamAdmin != null)
            {
                // Get the actual team name from the database
                var team = _context.Teams.FirstOrDefault(t => t.Id == teamAdmin.TeamId);
                ViewBag.UserTeam = team?.Name ?? "teamA";
            }
            else
            {
                // Default to first team if user not found
                var defaultTeam = _context.Teams.FirstOrDefault();
                ViewBag.UserTeam = defaultTeam?.Name ?? "teamA";
            }

            return View();
        }

        // POST: Receive the form data and save it
        [HttpPost]
        public IActionResult Create(StudyRecord record)
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(record.Team) ||
                string.IsNullOrWhiteSpace(record.Environment) ||
                string.IsNullOrWhiteSpace(record.FirstName) ||
                string.IsNullOrWhiteSpace(record.StudentIQLevel) ||
                string.IsNullOrWhiteSpace(record.MiddleName) ||
                string.IsNullOrWhiteSpace(record.StudentRollNumber) ||
                string.IsNullOrWhiteSpace(record.LastName) ||
                string.IsNullOrWhiteSpace(record.StudentRollName) ||
                string.IsNullOrWhiteSpace(record.DateOfBirth) ||
                string.IsNullOrWhiteSpace(record.StudentParentEmailAddress) ||
                string.IsNullOrWhiteSpace(record.EmailAddress) ||
                string.IsNullOrWhiteSpace(record.Status) ||
                string.IsNullOrWhiteSpace(record.StudentIdentityID) ||
                string.IsNullOrWhiteSpace(record.Type) ||
                string.IsNullOrWhiteSpace(record.StudentInitialID) ||
                string.IsNullOrWhiteSpace(record.Tags) ||
                string.IsNullOrWhiteSpace(record.Release) ||
                string.IsNullOrWhiteSpace(record.Comments))
            {
                TempData["ErrorMessage"] = "Missing Mandatory study record data";

                // Get user's team again for the view
                string username = ViewBag.Username?.ToString() ?? Environment.UserName;
                var teamAdmin = _context.TeamAdmins
                    .ToList()
                    .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

                if (teamAdmin != null)
                {
                    // Get the actual team name from the database
                    var team = _context.Teams.FirstOrDefault(t => t.Id == teamAdmin.TeamId);
                    ViewBag.UserTeam = team?.Name ?? "teamA";
                }
                else
                {
                    // Default to first team if user not found
                    var defaultTeam = _context.Teams.FirstOrDefault();
                    ViewBag.UserTeam = defaultTeam?.Name ?? "teamA";
                }

                return View(record);
            }

            // Set the created date
            record.CreatedDate = DateTime.UtcNow;

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

            // Find the TeamAdmin record for this user - Load to memory first, then filter
            var teamAdmin = _context.TeamAdmins
                .ToList()
                .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

            if (teamAdmin != null)
            {
                // Get the actual team name from the database
                var team = _context.Teams.FirstOrDefault(t => t.Id == teamAdmin.TeamId);
                ViewBag.UserTeam = team?.Name ?? "teamA";
            }
            else
            {
                // Default to first team if user not found
                var defaultTeam = _context.Teams.FirstOrDefault();
                ViewBag.UserTeam = defaultTeam?.Name ?? "teamA";
            }

            return View();
        }

        // POST: Handle the View button click
        [HttpPost]
        public IActionResult ViewStudents(string filterType, string filterValue)
        {
            // Get current user's team info (same as GET action)
            string username = ViewBag.Username?.ToString() ?? Environment.UserName;

            // Load to memory first, then filter
            var teamAdmin = _context.TeamAdmins
                .ToList()
                .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

            if (teamAdmin != null)
            {
                // Get the actual team name from the database
                var team = _context.Teams.FirstOrDefault(t => t.Id == teamAdmin.TeamId);
                ViewBag.UserTeam = team?.Name ?? "teamA";
            }
            else
            {
                // Default to first team if user not found
                var defaultTeam = _context.Teams.FirstOrDefault();
                ViewBag.UserTeam = defaultTeam?.Name ?? "teamA";
            }

            // Query the database based on filterType and filterValue
            if (!string.IsNullOrEmpty(filterType) && !string.IsNullOrEmpty(filterValue))
            {
                var allRecords = _context.StudyRecords.ToList();
                List<StudyRecord> results = new List<StudyRecord>();

                switch (filterType)
                {
                    case "Team":
                        results = allRecords
                            .Where(r => r.Team != null && r.Team.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                    case "Environment":
                        results = allRecords
                            .Where(r => r.Environment != null && r.Environment.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                    case "RollNumber":
                        results = allRecords
                            .Where(r => r.StudentRollNumber != null && r.StudentRollNumber.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                    case "EmailAddress":
                        results = allRecords
                            .Where(r => r.EmailAddress != null && r.EmailAddress.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                }

                ViewBag.Results = results;
                ViewBag.FilterType = filterType;
                ViewBag.FilterValue = filterValue;
            }

            return View();
        }

        // GET: Show the Edit page for a study record
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var record = _context.StudyRecords.ToList().FirstOrDefault(r => r.Id == id);
            if (record == null)
            {
                return NotFound();
            }
            return View(record);
        }

        // POST: Update only the Comments field
        [HttpPost]
        public IActionResult Edit(int id, string Comments)
        {
            var record = _context.StudyRecords.ToList().FirstOrDefault(r => r.Id == id);
            if (record == null)
            {
                return NotFound();
            }

            // Update only the Comments field
            record.Comments = Comments;
            _context.SaveChanges();

            TempData["SuccessMessage"] = "Study record updated successfully!";
            return RedirectToAction("ViewStudents");
        }
    }
}
