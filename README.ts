// Query the database based on filterType and filterValue
            if (!string.IsNullOrEmpty(filterType) && !string.IsNullOrEmpty(filterValue))
            {
                var allRecords = _context.StudyRecords.ToList();
                List<StudyRecord> results = new List<StudyRecord>();

                switch (filterType)
                {
                    case "Team":
                        results = allRecords
                            .Where(r => r.Team != null && r.Team.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                    case "Environment":
                        results = allRecords
                            .Where(r => r.Environment != null && r.Environment.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                    case "RollNumber":
                        results = allRecords
                            .Where(r => r.StudentRollNumber != null && r.StudentRollNumber.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                    case "EmailAddress":
                        results = allRecords
                            .Where(r => r.EmailAddress != null && r.EmailAddress.Equals(filterValue, StringComparison.OrdinalIgnoreCase))
                            .ToList();
                        break;
                }

                ViewBag.Results = results;
                ViewBag.FilterType = filterType;
                ViewBag.FilterValue = filterValue;
            }
