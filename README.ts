    // API endpoint to get the next available study record ID
        [HttpGet]
        public JsonResult GetNextStudyRecordId()
        {
            var maxId = _context.StudyRecords.Max(r => (int?)r.Id) ?? 0;
            var nextId = maxId + 1;
            return Json(new { nextId = nextId });
        }
