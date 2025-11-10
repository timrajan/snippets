 // Get user role
            var role = ViewBag.Role?.ToString() ?? "TeamAdmin";

            // If SuperAdmin, pass all teams to the view
            if (role == "SuperAdmin")
            {
                ViewBag.Teams = _context.Teams.ToList();
            }
