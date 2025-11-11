RuntimeBinderException: Cannot convert type 'System.Collections.Generic.List<Models.Team>' to 'System.Collections.Generic.List<object>'

@{
    ViewData["Title"] = "Team Admins";
    var teamDictionary = ((List<dynamic>)ViewBag.TeamList).ToDictionary(t => t.Id, t => t.Name);
}

<h2>Team Admins</h2>

<table class="table table-hover">
    <thead>
        <tr>
            <th>Admin Name</th>
            <th>Team Name</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach(var admin in ViewBag.TeamAdminList)
        {
            @{
                string teamName = teamDictionary.ContainsKey(admin.TeamId) 
                    ? teamDictionary[admin.TeamId] 
                    : "No Team";
            }
            
            <tr>
                <td>@admin.Name</td>
                <td>@teamName</td>
                <td>
                    <span class="badge badge-success">Active</span>
                </td>
            </tr>
        }
    </tbody>
</table>
