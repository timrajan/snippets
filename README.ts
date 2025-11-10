  @if (role == "SuperAdmin")
    {
        <div class="form-row">
            <label for="TeamId" class="form-label">Team</label>
            <select id="TeamId"
                    name="TeamId"
                    class="form-input"
                    required>
                <option value="">-- Select Team --</option>
                @if (ViewBag.Teams != null)
                {
                    @foreach (var team in (List<StudentManagement.Models.Team>)ViewBag.Teams)
                    {
                        <option value="@team.Id">@team.Name</option>
                    }
                }
            </select>
        </div>
    }
