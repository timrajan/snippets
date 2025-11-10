 <select id="teamId" name="teamId" onchange="this.form.submit()">
        <option value="">-- All Teams --</option>
        @foreach (var team in Model.Teams)
        {
            <option value="@team.Id" @(Model.SelectedTeamId == team.Id ? "selected" : "")>
                @team.Name
            </option>
        }
    </select>
