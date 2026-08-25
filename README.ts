namespace YourApp.ViewModels;

public class UserSummaryViewModel
{
    public string   Email         { get; set; }
    public int      RowCount      { get; set; }
    public DateTime LatestCreated { get; set; }
    public string   Ids           { get; set; }   // "12, 47, 103, 219"
}


public IActionResult Index()
{
    var model = _context.Users
        .Where(x => x.Status == "New")
        .GroupBy(x => x.Email)
        .Select(g => new UserSummaryViewModel
        {
            Email         = g.Key,
            RowCount      = g.Count(),
            LatestCreated = g.Max(x => x.CreatedDate)
        })
        .OrderByDescending(x => x.LatestCreated)
        .Take(5)
        .ToList();

    var emails = model.Select(x => x.Email).ToList();

    var idLookup = _context.Users
        .Where(x => x.Status == "New" && emails.Contains(x.Email))
        .Select(x => new { x.Email, x.Id })
        .ToList()
        .GroupBy(x => x.Email)
        .ToDictionary(
            g => g.Key,
            g => string.Join(", ", g.Select(y => y.Id).OrderBy(i => i)));

    foreach (var item in model)
        item.Ids = idLookup.TryGetValue(item.Email, out var ids) ? ids : "";

    return View(model);
}
