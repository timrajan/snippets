[HttpGet]
public IActionResult PendingRecords() => View();

[HttpGet]
public IActionResult PendingRecordsData()
{
    var results = PendingQuery();
    Response.Headers["Cache-Control"] = "no-store";
    return Json(new { count = results.Count, rows = results });
}

[HttpGet]
public IActionResult PendingCount()
{
    Response.Headers["Cache-Control"] = "no-store";
    return Json(new { count = PendingQuery().Count });
}
