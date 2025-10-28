
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
