.Select(g => new UserSummary
    {
        Email         = g.Key,
        RowCount      = g.Count(),
        LatestCreated = g.Max(x => x.CreatedDate)
    })
