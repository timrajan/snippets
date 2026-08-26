private List<UserSummaryViewModel> PendingQuery()
{
    // created_at is timestamp WITHOUT time zone — local, so Now not UtcNow
    var cutoff = DateTime.Now.AddHours(-1);

    var allRecords = _context.YourDbSet
        .AsNoTracking()
        .Where(x => x.Status.ToLower() == "new" && x.CreatedDate >= cutoff)
        .ToList();                      // SQL stops here

    return allRecords
        .GroupBy(x => x.Email)
        .OrderByDescending(g => g.Max(x => x.CreatedDate))
        .Select(g => new UserSummaryViewModel
        {
            Email         = g.Key,
            RowCount      = g.Count(),
            LatestCreated = g.Max(x => x.CreatedDate),
            Ids           = string.Join(", ", g.Select(x => x.Id).OrderBy(i => i))
        })
        .ToList();
}
