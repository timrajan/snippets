// GET: Load page with optional team filter
    public ActionResult Index(int? teamId)
    {
        var model = new YourViewModel
        {
            // Load all teams for dropdown
            Teams = _context.Teams.Select(t => new TeamDto
            {
                TeamId = t.Id,
                TeamName = t.Name
            }).ToList(),
            
            SelectedTeamId = teamId
        };

        // Load team members based on selection
        if (teamId.HasValue)
        {
            // Load specific team members
            model.TeamMembers = _context.TeamMembers
                .Where(m => m.TeamId == teamId.Value)
                .Select(m => new TeamMemberDto
                {
                    Name = m.Name,
                    Email = m.Email,
                    Role = m.Role,
                    TeamName = m.Team.Name
                })
                .ToList();
        }
        else
        {
            // Load all team members (default)
            model.TeamMembers = _context.TeamMembers
                .Select(m => new TeamMemberDto
                {
                    Name = m.Name,
                    Email = m.Email,
                    Role = m.Role,
                    TeamName = m.Team.Name
                })
                .ToList();
        }

        return View(model);
    }
