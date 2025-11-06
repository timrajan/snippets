 // Add to database first to get the auto-generated ID
            _context.StudyRecords.Add(record);
            _context.SaveChanges();

            // Now generate the email address using the actual assigned ID
            var formattedId = record.Id.ToString("D3"); // Format with leading zeros (001, 002, etc.)
            record.EmailAddress = $"{record.Team}-{record.Environment}-{record.Type}-{formattedId}@gmail.com";

            // Update the record with the generated email
            _context.SaveChanges();


<input type="text" id="EmailAddress" name="EmailAddress" value="@Model?.EmailAddress" readonly style="background-color: #f5f5f5; cursor: not-allowed;" />

  let nextRecordId = 1;

    // Fetch the next available record ID when page loads
    document.addEventListener('DOMContentLoaded', function() {
        fetchNextRecordId();

        // Add change event listeners to Team, Environment, and Type fields
        document.getElementById('Team').addEventListener('change', generateEmailAddress);
        document.getElementById('Environment').addEventListener('change', generateEmailAddress);
        document.getElementById('Type').addEventListener('change', generateEmailAddress);
    });

    function fetchNextRecordId() {
        fetch('/StudyRecord/GetNextStudyRecordId')
            .then(response => response.json())
            .then(data => {
                nextRecordId = data.nextId;
                generateEmailAddress();
            })
            .catch(error => {
                console.error('Error fetching next record ID:', error);
            });
    }

    function generateEmailAddress() {
        const team = document.getElementById('Team').value;
        const environment = document.getElementById('Environment').value;
        const type = document.getElementById('Type').value;

        if (team && environment && type && team !== '-- Select --' && environment !== '-- Select --') {
            // Format the ID with leading zeros (e.g., 001, 002, 010, 100)
            const formattedId = String(nextRecordId).padStart(3, '0');
            const email = `${team}-${environment}-${type}-${formattedId}@gmail.com`;
            document.getElementById('EmailAddress').value = email;
        } else {
            document.getElementById('EmailAddress').value = '';
        }
    }

