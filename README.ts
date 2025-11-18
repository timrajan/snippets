public class StudentController : Controller
{
    // Assuming you have a database context
    // private YourDbContext db = new YourDbContext();

    // GET: Student/Register (Page 1)
    [HttpGet]
    public ActionResult Register()
    {
        return View();
    }

    // POST: Student/Register (Page 1 - Continue button)
    [HttpPost]
    public ActionResult Register(Student student)
    {
        if (!ModelState.IsValid)
        {
            return View(student);
        }

        // Store basic student info in TempData
        TempData["StudentName"] = student.Name;
        TempData["StudentEmail"] = student.Email;
        TempData["StudentDateOfBirth"] = student.DateOfBirth;
        // Store all other common fields similarly
        
        return RedirectToAction("PreviousAddresses");
    }

    // GET: Student/PreviousAddresses (Page 2)
    [HttpGet]
    public ActionResult PreviousAddresses()
    {
        // Check if we have basic info from page 1
        if (TempData["StudentName"] == null)
        {
            return RedirectToAction("Register");
        }
        
        // Keep the data for the POST
        TempData.Keep();
        return View();
    }

    // POST: Student/PreviousAddresses (Page 2 - Final Submit)
    [HttpPost]
    public ActionResult PreviousAddresses(List<AddressSchoolPair> addressSchoolPairs)
    {
        // Retrieve basic info from TempData
        var studentName = TempData["StudentName"] as string;
        var studentEmail = TempData["StudentEmail"] as string;
        var studentDateOfBirth = TempData["StudentDateOfBirth"] as string;
        
        if (studentName == null)
        {
            return RedirectToAction("Register");
        }

        // Create multiple student records - one for each address/school pair
        foreach (var pair in addressSchoolPairs)
        {
            var student = new Student
            {
                Name = studentName,
                Email = studentEmail,
                DateOfBirth = studentDateOfBirth,
                // ... assign all other common fields
                
                PreviousAddress = pair.PreviousAddress,
                PreviousSchoolName = pair.PreviousSchoolName
            };

            // Insert into database
            db.Students.Add(student);
        }

        // Save all records
        db.SaveChanges();

        return RedirectToAction("Success");
    }

    public ActionResult Success()
    {
        return View();
    }
}
