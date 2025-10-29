@{
    ViewData["Title"] = "View Students";
}

<style>
    .container {
        background-color: white;
        padding: 80px;
        margin: 0 auto;
        max-width: 800px;
        min-height: 400px;
    }

    h1 {
        text-align: center;
        color: #333;
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 80px;
    }

    .form-row {
        display: flex;
        align-items: center;
        gap: 40px;
        margin-bottom: 40px;
    }

    .form-row label {
        font-size: 20px;
        font-weight: bold;
        color: #000;
        min-width: 250px;
        text-align: left;
    }

    .form-row select,
    .form-row input[type="text"] {
        flex: 1;
        padding: 12px;
        border: 1px solid #000;
        border-radius: 4px;
        font-size: 16px;
        font-family: Arial, sans-serif;
        background-color: white;
    }

    .button-container {
        text-align: center;
        margin-top: 60px;
    }

    .view-btn {
        background-color: white;
        color: #000;
        padding: 12px 50px;
        border: 1px solid #000;
        border-radius: 25px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
    }

    .view-btn:hover {
        background-color: #f0f0f0;
    }

    #dynamicFieldRow {
        display: none;
    }

    .results-container {
        margin-top: 60px;
        padding: 0 40px;
        text-align: center;
        width: 100%;
    }

    .results-title {
        font-size: 24px;
        font-weight: bold;
        color: #000;
        margin-bottom: 20px;
    }

    .results-table {
        width: 80%;
        max-width: 1200px;
        border-collapse: collapse;
        margin: 20px auto 0 auto;
        text-align: left;
    }

    .results-table th {
        background-color: #f5f5f5;
        text-align: left;
        padding: 15px;
        font-weight: bold;
        font-size: 16px;
        color: #000;
        border: 1px solid #ddd;
    }

    .results-table td {
        padding: 12px 15px;
        font-size: 14px;
        color: #000;
        border: 1px solid #ddd;
    }

    .results-table tr:hover {
        background-color: #f9f9f9;
    }

    .no-results {
        text-align: center;
        padding: 30px;
        color: #999;
        font-size: 16px;
    }
</style>

<div class="container">
    <h1>View Students</h1>

        <form method="post" action="/StudyRecord/ViewStudents">
            <div class="form-row">
                <label for="filterType">View Students By</label>
                <select id="filterType" name="filterType" onchange="handleFilterChange()">
                    <option value="">-- Select --</option>
                    <option value="Team">Team</option>
                    <option value="Environment">Environment</option>
                    <option value="RollNumber">Roll Number</option>
                    <option value="EmailAddress">Email Address</option>
                </select>
            </div>

            <div class="form-row" id="dynamicFieldRow">
                <label id="dynamicLabel"></label>
                <select id="dynamicDropdown" name="filterValue" style="display: none;">
                </select>
                <input type="text" id="dynamicTextbox" name="filterValue" style="display: none;" />
            </div>

            <div class="button-container">
                <button type="submit" class="view-btn">View</button>
            </div>
        </form>
    </div>

@if (ViewBag.Results != null)
{
    <div class="results-container">
        <h2 class="results-title">Results for @ViewBag.FilterType: @ViewBag.FilterValue</h2>

        @if (((List<StudentManagement.Models.StudyRecord>)ViewBag.Results).Count > 0)
        {
            <table class="results-table">
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Email Address</th>
                        <th>Student Initial ID</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach (var record in (List<StudentManagement.Models.StudyRecord>)ViewBag.Results)
                    {
                        <tr>
                            <td>@record.FirstName</td>
                            <td>@record.EmailAddress</td>
                            <td>@record.StudentInitialID</td>
                        </tr>
                    }
                </tbody>
            </table>
        }
        else
        {
            <div class="no-results">
                No records found matching your criteria.
            </div>
        }
    </div>
}

<script>
    // Get user's team from server
    var userTeam = '@ViewBag.UserTeam';

    function handleFilterChange() {
        const filterType = document.getElementById('filterType').value;
        const dynamicFieldRow = document.getElementById('dynamicFieldRow');
        const dynamicLabel = document.getElementById('dynamicLabel');
        const dynamicDropdown = document.getElementById('dynamicDropdown');
        const dynamicTextbox = document.getElementById('dynamicTextbox');

        // Hide everything first
        dynamicFieldRow.style.display = 'none';
        dynamicDropdown.style.display = 'none';
        dynamicTextbox.style.display = 'none';

        if (filterType === '') {
            return;
        }

        // Show the row
        dynamicFieldRow.style.display = 'flex';

        if (filterType === 'Team') {
            // Show dropdown with only user's team
            dynamicLabel.textContent = 'Team';
            dynamicDropdown.innerHTML = '<option value="">-- Select --</option>' +
                                       '<option value="' + userTeam + '">' + userTeam + '</option>';
            dynamicDropdown.style.display = 'block';
            dynamicTextbox.removeAttribute('name');
            dynamicDropdown.setAttribute('name', 'filterValue');
        } else if (filterType === 'Environment') {
            // Show dropdown with environment options
            dynamicLabel.textContent = 'Environment';
            dynamicDropdown.innerHTML = '<option value="">-- Select --</option>' +
                                       '<option value="AAA">AAA</option>' +
                                       '<option value="BBB">BBB</option>';
            dynamicDropdown.style.display = 'block';
            dynamicTextbox.removeAttribute('name');
            dynamicDropdown.setAttribute('name', 'filterValue');
        } else if (filterType === 'RollNumber' || filterType === 'EmailAddress') {
            // Show textbox
            dynamicLabel.textContent = filterType === 'RollNumber' ? 'Roll Number' : 'Email Address';
            dynamicTextbox.style.display = 'block';
            dynamicDropdown.removeAttribute('name');
            dynamicTextbox.setAttribute('name', 'filterValue');
        }
    }
</script>
