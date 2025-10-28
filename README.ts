    // Check if team name already exists
            var existingTeam = _context.Teams
                .ToList()
                .FirstOrDefault(t => t.Name != null && t.Name.Equals(team.Name, StringComparison.OrdinalIgnoreCase));

            if (existingTeam != null)
            {
                ViewBag.Error = $"A team with the name '{team.Name}' already exists. Please use a different name.";
                return View(team);
            }
