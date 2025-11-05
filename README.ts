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

                return View(record);
            }
