using Microsoft.AspNetCore.Mvc;
using StudentManagement.Data;
using StudentManagement.Models;

namespace StudentManagement.Controllers
{
    public class TeamController : BaseController
    {
        private readonly ApplicationDbContext _context;

        public TeamController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Show all teams
        public IActionResult Index()
        {
            // Load teams with related data
            var teamAdmins = _context.TeamAdmins.ToList();
            var students = _context.Students.ToList();

            // We need to pass BOTH teams and their admins/students to the view
            ViewBag.TeamAdmins = teamAdmins;
            ViewBag.Students = students;

            // Get the current user's role and username
            var role = ViewBag.Role as string;
            var currentUsername = Environment.UserName;

            // If TeamAdmin, only show their own team
            if (role == "TeamAdmin")
            {
                // Find the team(s) that this admin manages
                var adminRecord = _context.TeamAdmins
                    .FirstOrDefault(ta => ta.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase));

                if (adminRecord != null)
                {
                    // Return only the teams this admin manages
                    var adminTeams = _context.Teams
                        .Where(t => t.Id == adminRecord.TeamId)
                        .ToList();
                    return View(adminTeams);
                }
            }

            // For SuperAdmin or if no admin record found, show all teams
            var allTeams = _context.Teams.ToList();
            return View(allTeams);
        }

        // GET: Show the form to create a new team
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        // POST: Receive the form data and create the team
        [HttpPost]
        public IActionResult Create(Team team, string adminName, string adminEmail)
        {
            // Validate team data
            if (string.IsNullOrEmpty(team.Name))
            {
                ViewBag.Error = "Team name is required.";
                return View(team);
            }

            // Validate at least one admin
            if (string.IsNullOrEmpty(adminName))
            {
                ViewBag.Error = "Admin name is required.";
                return View(team);
            }

            // Set default description if not provided
            if (string.IsNullOrEmpty(team.Description))
            {
                team.Description = $"Team managed by {adminName}";
            }

            // Set the created date
            team.CreatedDate = DateTime.Now;

            // Add the team (EF will auto-generate the ID)
            _context.Teams.Add(team);
            _context.SaveChanges();

            // Create the first Team Admin
            var newAdmin = new TeamAdmin
            {
                TeamId = team.Id,
                Name = adminName,
                Email = string.IsNullOrEmpty(adminEmail) ? $"{adminName.Replace(" ", "").ToLower()}@school.com" : adminEmail,
                Username = "", // No Windows username by default
                AddedDate = DateTime.Now
            };

            _context.TeamAdmins.Add(newAdmin);
            _context.SaveChanges();

            // Show success message
            TempData["SuccessMessage"] = $"Team '{team.Name}' has been created with {adminName} as Team Admin!";

            // Redirect to the teams list
            return RedirectToAction("Index");
        }

        // GET: Show form to add another admin to an existing team
        [HttpGet]
        public IActionResult AddAdmin(int teamId)
        {
            var team = _context.Teams.FirstOrDefault(t => t.Id == teamId);
            if (team == null)
            {
                return NotFound();
            }

            ViewBag.Team = team;
            return View();
        }

        // POST: Add a new admin to a team
        [HttpPost]
        public IActionResult AddAdmin(int teamId, string adminName, string adminEmail)
        {
            var team = _context.Teams.FirstOrDefault(t => t.Id == teamId);
            if (team == null)
            {
                return NotFound();
            }

            // Validate
            if (string.IsNullOrEmpty(adminName) || string.IsNullOrEmpty(adminEmail))
            {
                ViewBag.Error = "Admin name and email are required.";
                ViewBag.Team = team;
                return View();
            }

            // Create the new admin
            var newAdmin = new TeamAdmin
            {
                TeamId = teamId,
                Name = adminName,
                Email = adminEmail,
                Username = "", // No Windows username by default
                AddedDate = DateTime.Now
            };

            _context.TeamAdmins.Add(newAdmin);
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"{adminName} has been added as a Team Admin for '{team.Name}'!";

            return RedirectToAction("Index");
        }

        // GET: Show form to remove a team
        [HttpGet]
        public IActionResult Remove()
        {
            return View();
        }

        // POST: Remove a team by name
        [HttpPost]
        public IActionResult Remove(string teamName)
        {
            if (string.IsNullOrEmpty(teamName))
            {
                ViewBag.Error = "Team name is required.";
                return View();
            }

            var team = _context.Teams
                .FirstOrDefault(t => t.Name.Equals(teamName, StringComparison.OrdinalIgnoreCase));

            if (team == null)
            {
                ViewBag.Error = $"Team '{teamName}' not found.";
                return View();
            }

            // Remove all admins associated with this team
            var adminsToRemove = _context.TeamAdmins
                .Where(a => a.TeamId == team.Id)
                .ToList();
            _context.TeamAdmins.RemoveRange(adminsToRemove);

            // Remove the team
            _context.Teams.Remove(team);
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Team '{teamName}' has been removed successfully!";
            return RedirectToAction("Index");
        }

        // GET: Show form to add a team member
        [HttpGet]
        public IActionResult AddMember()
        {
            return View();
        }

        // POST: Add a new team member (student)
        [HttpPost]
        public IActionResult AddMember(string name, string createAccess)
        {
            // Validate
            if (string.IsNullOrEmpty(name))
            {
                ViewBag.Error = "Name is required.";
                return View();
            }

            // Get the current Windows username
            var currentUsername = Environment.UserName;

            // Find the team(s) that this admin manages
            var adminRecord = _context.TeamAdmins
                .FirstOrDefault(ta => ta.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase));

            if (adminRecord == null)
            {
                ViewBag.Error = "You are not authorized to add team members. No team admin record found for your username.";
                return View();
            }

            // Get the team
            var team = _context.Teams.FirstOrDefault(t => t.Id == adminRecord.TeamId);
            if (team == null)
            {
                ViewBag.Error = "Your assigned team could not be found.";
                return View();
            }

            // Create the new student (team member) - only for the admin's team
            var newStudent = new Student
            {
                Name = name,
                Email = $"{name.Replace(" ", "").ToLower()}@school.com",
                TeamId = team.Id,
                EnrollmentDate = DateTime.Now,
                Role = createAccess == "Yes" ? "Creator" : "Viewer"
            };

            _context.Students.Add(newStudent);
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"{name} has been added to {team.Name} with {(createAccess == "Yes" ? "Creator" : "Viewer")} access!";

            return RedirectToAction("Index");
        }

        // GET: Show form to remove a team member
        [HttpGet]
        public IActionResult RemoveMember()
        {
            return View();
        }

        // POST: Remove a team member by name
        [HttpPost]
        public IActionResult RemoveMember(string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                ViewBag.Error = "Name is required.";
                return View();
            }

            // Get the current Windows username
            var currentUsername = Environment.UserName;

            // Find the team(s) that this admin manages
            var adminRecord = _context.TeamAdmins
                .FirstOrDefault(ta => ta.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase));

            if (adminRecord == null)
            {
                ViewBag.Error = "You are not authorized to remove team members. No team admin record found for your username.";
                return View();
            }

            // Find the student
            var student = _context.Students
                .FirstOrDefault(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

            if (student == null)
            {
                ViewBag.Error = $"Team member '{name}' not found.";
                return View();
            }

            // Verify the student belongs to the admin's team
            if (student.TeamId != adminRecord.TeamId)
            {
                ViewBag.Error = $"You can only remove members from your own team. '{name}' belongs to a different team.";
                return View();
            }

            // Remove all sports records for this student
            var sportsRecordsToRemove = _context.SportsRecords
                .Where(sr => sr.StudentId == student.Id)
                .ToList();
            _context.SportsRecords.RemoveRange(sportsRecordsToRemove);

            // Remove the student
            _context.Students.Remove(student);
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"Team member '{name}' has been removed successfully!";
            return RedirectToAction("Index");
        }
    }
}
