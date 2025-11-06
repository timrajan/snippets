 // Add to database first to get the auto-generated ID
            _context.StudyRecords.Add(record);
            _context.SaveChanges();

            // Now generate the email address using the actual assigned ID
            var formattedId = record.Id.ToString("D3"); // Format with leading zeros (001, 002, etc.)
            record.EmailAddress = $"{record.Team}-{record.Environment}-{record.Type}-{formattedId}@gmail.com";

            // Update the record with the generated email
            _context.SaveChanges();
