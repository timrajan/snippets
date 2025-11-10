var model = new TeamIndexViewModel
        {
            Teams = _context.Teams.ToList(),
            SelectedTeamId = teamId
        };

        if (teamId.HasValue)
        {
            model.TeamMembers = _context.TeamMembers
                .Where(m => m.TeamId == teamId.Value)
                .ToList();
        }
        else
        {
            model.TeamMembers = _context.TeamMembers.ToList();
        }

        return View(model);
