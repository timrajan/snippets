var result = allRecords
    .Where(x => x.Status == "New")
    .GroupBy(x => x.Email)
    .OrderByDescending(g => g.Max(x => x.CreatedDate))
    .Select(g => new UserSummaryViewModel
    {
        Email    = g.Key,
        RowCount = g.Count(),
        Ids      = string.Join(", ", g.Select(x => x.Id).OrderBy(i => i)),
        IdsHtml  = string.Join("", g.Select(x => x.Id).OrderBy(i => i)
                        .Select(id => $"<div class='py-1 border-bottom'>#{id}</div>"))
                   + $"<button type='button' class='btn btn-sm btn-outline-secondary w-100 mt-2 copy-ids' data-ids='{string.Join(", ", g.Select(x => x.Id).OrderBy(i => i))}'>Copy IDs</button>"
    })
    .Take(6)
    .ToList();
