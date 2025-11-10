  ViewBag.Teams = _context.Teams.ToList();
        ViewBag.SelectedTeamId = teamId;

        // Get team members based on selection
        List<TeamMember> teamMembers;
        
        if (teamId.HasValue)
        {
            teamMembers = _context.TeamMembers
                .Where(m => m.TeamId == teamId.Value)
                .ToList();
        }
        else
        {
            teamMembers = _context.TeamMembers.ToList();
        }
        
        ViewBag.TeamMembers = teamMembers;

        // Return the teams list as model (if you need it)
        var teams = _context.Teams.ToList();
        return View(teams);
