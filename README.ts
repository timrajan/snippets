  TempData["Message"] = "Record saved successfully!";
    TempData["MessageType"] = "success";
    TempData["RedirectUrl"] = Url.Action("Index", "Home", new { area = "" });

    return View(model);  // stay on same page
