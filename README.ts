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
