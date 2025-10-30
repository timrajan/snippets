   // GET: Show the Edit page for a study record
        [HttpGet]
        public IActionResult Edit(int id)
        {
            var record = _context.StudyRecords.ToList().FirstOrDefault(r => r.Id == id);
            if (record == null)
            {
                return NotFound();
            }
            return View(record);
        }

        // POST: Update only the Comments field
        [HttpPost]
        public IActionResult Edit(int id, string Comments)
        {
            var record = _context.StudyRecords.ToList().FirstOrDefault(r => r.Id == id);
            if (record == null)
            {
                return NotFound();
            }

            // Update only the Comments field
            record.Comments = Comments;
            _context.SaveChanges();

            TempData["SuccessMessage"] = "Study record updated successfully!";
            return RedirectToAction("ViewStudents");
        }
