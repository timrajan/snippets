[HttpGet]
public IActionResult PendingRecordsData()
{
    try
    {
        var results = PendingQuery();
        Response.Headers["Cache-Control"] = "no-store";
        return Json(new { count = results.Count, rows = results });
    }
    catch (Exception ex)
    {
        return Json(new { error = ex.ToString() });
    }
}
