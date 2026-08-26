private IQueryable<YourExistingModel> PendingQuery()
{
    // created_at is timestamp WITHOUT time zone — local time, so Now not UtcNow
    var cutoff = DateTime.Now.AddHours(-1);

    return _context.YourExistingDbSet
        .AsNoTracking()
        .Where(x => x.Status.ToLower() == "new" && x.CreatedAt >= cutoff)
        .OrderByDescending(x => x.CreatedAt);
}
