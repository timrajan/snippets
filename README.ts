<div class="page-header d-flex align-items-center justify-content-between">
   <h1 class="page-title mb-0"><b>Management</b></h1>
   @using (Html.BeginForm("Index","Team", FormMethod.Get))
   {
      <div class="d-flex align-items-center gap-2">
          <label for="teamId" class="mb-0">Team Name</label>
          <select class="form-select w-auto" id="teamId" onchange="this.form.submit()">
              <option value="">All Teams</option>
              @foreach (var team in Model.Teams)
              {
                  <option value="@team.Id" selected="@(Model.SelectedTeamId == team.Id)">
                      @team.Name
                  </option>
              }
          </select>
      </div>
   }
</div>
