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

        // GET: Teams Management - Create/Delete Teams (SuperAdmin only)
        public IActionResult TeamsManagement()
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can access Teams Management.";
                return RedirectToAction("Index", "Home");
            }

            // Load teams with related data
            var teamAdmins = _context.TeamAdmins.ToList();
            var students = _context.Students.ToList();

            // We need to pass BOTH teams and their admins/students to the view
            ViewBag.TeamAdmins = teamAdmins;
            ViewBag.Students = students;

            // Show all teams (distinct to avoid duplicates)
            var allTeams = _context.Teams.Distinct().ToList();
            return View("Index", allTeams);
        }

        // GET: Team Management - Add/Remove Team Members (TeamAdmin ONLY)
        public IActionResult TeamManagement()
        {
            var role = ViewBag.Role as string;

            // Only TeamAdmin can access Team Management
            if (role != "TeamAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only Team Admins can access Team Management.";
                return RedirectToAction("Index", "Home");
            }

            // Get current user's team
            var username = ViewBag.Username?.ToString() ?? Environment.UserName;
            var adminRecord = _context.TeamAdmins
                .ToList()
                .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

            if (adminRecord == null)
            {
                TempData["ErrorMessage"] = "No team admin record found for your username.";
                return RedirectToAction("Index", "Home");
            }

            // Get team info and students
            var team = _context.Teams.FirstOrDefault(t => t.Id == adminRecord.TeamId);
            var students = _context.Students.Where(s => s.TeamId == adminRecord.TeamId).ToList();

            ViewBag.TeamName = team?.Name;
            ViewBag.TeamId = adminRecord.TeamId;

            return View("TeamAdminIndex", students);
        }

        // Legacy Index action - redirect to appropriate page based on role
        public IActionResult Index()
        {
            var role = ViewBag.Role as string;
            if (role == "SuperAdmin")
            {
                return RedirectToAction("TeamsManagement");
            }
            else if (role == "TeamAdmin")
            {
                return RedirectToAction("TeamManagement");
            }
            else
            {
                TempData["ErrorMessage"] = "Access denied.";
                return RedirectToAction("Index", "Home");
            }
        }

        // GET: Show the form to create a new team
        [HttpGet]
        public IActionResult Create()
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can create teams.";
                return RedirectToAction("Index", "Home");
            }

            return View();
        }

        // POST: Receive the form data and create the team
        [HttpPost]
        public IActionResult Create(Team team, string adminName, string adminEmail)
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can create teams.";
                return RedirectToAction("Index", "Home");
            }

            // Validate team data
            if (string.IsNullOrEmpty(team.Name))
            {
                ViewBag.Error = "Team name is required.";
                return View(team);
            }

            // Check if team name already exists
            var existingTeam = _context.Teams
                .ToList()
                .FirstOrDefault(t => t.Name != null && t.Name.Equals(team.Name, StringComparison.OrdinalIgnoreCase));

            if (existingTeam != null)
            {
                ViewBag.Error = $"A team with the name '{team.Name}' already exists. Please use a different name.";
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
            team.CreatedDate = DateTime.UtcNow;

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
                AddedDate = DateTime.UtcNow
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
        [Route("Team/AddAdmin/{id}")]
        public IActionResult AddAdmin(int id)
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can add team admins.";
                return RedirectToAction("Index", "Home");
            }

            var team = _context.Teams.FirstOrDefault(t => t.Id == id);
            if (team == null)
            {
                TempData["ErrorMessage"] = $"Team with ID {id} not found.";
                return RedirectToAction("Index");
            }

            ViewBag.Team = team;
            return View();
        }

        // POST: Add a new admin to a team
        [HttpPost]
        [Route("Team/AddAdmin/{id}")]
        public IActionResult AddAdmin(int id, [FromForm] string adminUsername)
        {
            // Debug logging
            Console.WriteLine($"DEBUG: id={id}, adminUsername='{adminUsername ?? "NULL"}'");

            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can add team admins.";
                return RedirectToAction("Index", "Home");
            }

            var team = _context.Teams.FirstOrDefault(t => t.Id == id);
            if (team == null)
            {
                return NotFound();
            }

            // Validate
            if (string.IsNullOrEmpty(adminUsername))
            {
                Console.WriteLine("DEBUG: adminUsername is empty or null");
                ViewBag.Error = "Admin username is required.";
                ViewBag.Team = team;
                return View();
            }

            // Create the new admin
            var newAdmin = new TeamAdmin
            {
                TeamId = id,
                Name = adminUsername,
                Email = $"{adminUsername}@school.com",
                Username = adminUsername,
                AddedDate = DateTime.UtcNow
            };

            _context.TeamAdmins.Add(newAdmin);
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"{adminUsername} has been added as a Team Admin for '{team.Name}'!";

            return RedirectToAction("Index");
        }

        // GET: Show form to remove a team
        [HttpGet]
        public IActionResult Remove()
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can remove teams.";
                return RedirectToAction("Index", "Home");
            }

            return View();
        }

        // POST: Remove a team by name
        [HttpPost]
        public IActionResult Remove(string teamName)
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can remove teams.";
                return RedirectToAction("Index", "Home");
            }

            if (string.IsNullOrEmpty(teamName))
            {
                ViewBag.Error = "Team name is required.";
                return View();
            }

            var team = _context.Teams
                .ToList()
                .FirstOrDefault(t => t.Name != null && t.Name.Equals(teamName, StringComparison.OrdinalIgnoreCase));

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

        // POST: Remove selected teams by IDs
        [HttpPost]
        public IActionResult RemoveSelected(List<int> teamIds)
        {
            // Check if user is SuperAdmin
            var role = ViewBag.Role as string;
            if (role != "SuperAdmin")
            {
                TempData["ErrorMessage"] = "Access denied. Only SuperAdmins can remove teams.";
                return RedirectToAction("Index", "Home");
            }

            if (teamIds == null || !teamIds.Any())
            {
                TempData["ErrorMessage"] = "No teams selected for removal.";
                return RedirectToAction("Index");
            }

            // Get the teams to remove
            var teamsToRemove = _context.Teams
                .Where(t => teamIds.Contains(t.Id))
                .ToList();

            if (!teamsToRemove.Any())
            {
                TempData["ErrorMessage"] = "Selected teams not found.";
                return RedirectToAction("Index");
            }

            // Remove all admins associated with these teams
            var adminsToRemove = _context.TeamAdmins
                .Where(a => teamIds.Contains(a.TeamId))
                .ToList();
            _context.TeamAdmins.RemoveRange(adminsToRemove);

            // Remove all students associated with these teams
            var studentsToRemove = _context.Students
                .Where(s => teamIds.Contains(s.TeamId))
                .ToList();

            // Remove sports records for those students
            var studentIds = studentsToRemove.Select(s => s.Id).ToList();
            var sportsRecordsToRemove = _context.SportsRecords
                .Where(sr => studentIds.Contains(sr.StudentId))
                .ToList();
            _context.SportsRecords.RemoveRange(sportsRecordsToRemove);

            // Remove the students
            _context.Students.RemoveRange(studentsToRemove);

            // Remove the teams
            _context.Teams.RemoveRange(teamsToRemove);
            _context.SaveChanges();

            var teamNames = string.Join(", ", teamsToRemove.Select(t => t.Name));
            TempData["SuccessMessage"] = $"Teams removed successfully: {teamNames}";
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
            var allAdmins = _context.TeamAdmins.ToList();

            Console.WriteLine($"DEBUG AddMember: currentUsername='{currentUsername}'");
            Console.WriteLine($"DEBUG AddMember: Total TeamAdmins in DB: {allAdmins.Count}");
            foreach (var admin in allAdmins)
            {
                Console.WriteLine($"  - Id={admin.Id}, Name='{admin.Name}', Username='{admin.Username}', TeamId={admin.TeamId}");
            }

            var adminRecord = allAdmins
                .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase));

            if (adminRecord == null)
            {
                Console.WriteLine($"DEBUG AddMember: No admin record found for username '{currentUsername}'");
                ViewBag.Error = "You are not authorized to add team members. No team admin record found for your username.";
                return View();
            }

            Console.WriteLine($"DEBUG AddMember: Found admin record - Id={adminRecord.Id}, TeamId={adminRecord.TeamId}");

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
                EnrollmentDate = DateTime.UtcNow,
                Role = createAccess == "Yes" ? "Creator" : "Viewer"
            };

            _context.Students.Add(newStudent);
            _context.SaveChanges();

            TempData["SuccessMessage"] = $"{name} has been added to {team.Name} with {(createAccess == "Yes" ? "Creator" : "Viewer")} access!";

            return RedirectToAction("TeamManagement");
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
                .ToList()
                .FirstOrDefault(ta => ta.Username != null && ta.Username.Equals(currentUsername, StringComparison.OrdinalIgnoreCase));

            if (adminRecord == null)
            {
                ViewBag.Error = "You are not authorized to remove team members. No team admin record found for your username.";
                return View();
            }

            // Find the student
            var student = _context.Students
                .ToList()
                .FirstOrDefault(s => s.Name != null && s.Name.Equals(name, StringComparison.OrdinalIgnoreCase));

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
            return RedirectToAction("TeamManagement");
        }
    }
}
