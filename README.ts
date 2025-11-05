            <div class="submit-container">
                <button type="submit" class="submit-btn" onclick="return validateForm()">
                    CREATE STUDENT
                </button>
            </div>
        </form>
    </div>

<script>
    function validateForm() {
        const requiredFields = [
            { id: 'Team', name: 'Team' },
            { id: 'Environment', name: 'Environment' },
            { id: 'FirstName', name: 'First Name' },
            { id: 'StudentIQLevel', name: 'Student IQ Level' },
            { id: 'MiddleName', name: 'Middle Name' },
            { id: 'StudentRollNumber', name: 'Student Roll Number' },
            { id: 'LastName', name: 'Last Name' },
            { id: 'StudentRollName', name: 'Student Roll Name' },
            { id: 'DateOfBirth', name: 'Date Of Birth' },
            { id: 'StudentParentEmailAddress', name: 'Student Parent Email Address' },
            { id: 'EmailAddress', name: 'Email Address' },
            { id: 'Status', name: 'Status' },
            { id: 'StudentIdentityID', name: 'Student Identity ID' },
            { id: 'Type', name: 'Type' },
            { id: 'StudentInitialID', name: 'Student Initial ID' },
            { id: 'Tags', name: 'Tags' },
            { id: 'Release', name: 'Release' },
            { id: 'Comments', name: 'Comments' }
        ];

        let missingFields = [];

        for (let field of requiredFields) {
            const element = document.getElementById(field.id);
            const value = element.value.trim();

            if (!value || value === '-- Select --' || value === '') {
                missingFields.push(field.name);
            }
        }

        if (missingFields.length > 0) {
            alert('Missing Mandatory study record data');
            return false;
        }

        return true;
    }
</script>
