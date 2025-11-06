 // Update status to InProgress since build was triggered successfully
                record.Status = "InProgress";
                _context.SaveChanges();
                TempData["SuccessMessage"] = "Study record created and build pipeline triggered. Status: InProgress";
