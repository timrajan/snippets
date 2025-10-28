@model IEnumerable<StudentManagement.Models.Team>

@{
    var role = ViewBag.Role ?? "TeamAdmin";
    ViewData["Title"] = role == "SuperAdmin" ? "Teams Management" : "Team Management";
}

<style>
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 40px;
    }

    .page-title {
        font-size: 32px;
        font-weight: bold;
        color: #000;
        margin: 0;
    }

    .add-team-btn {
        background-color: #4054B5;
        color: white;
        border: none;
        border-radius: 30px;
        padding: 12px 40px;
        font-size: 16px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-block;
    }

    .add-team-btn:hover {
        background-color: #2f3f8f;
        box-shadow: 0 4px 12px rgba(64, 84, 181, 0.4);
        color: white;
        text-decoration: none;
    }

    .button-group {
        display: flex;
        gap: 15px;
    }

    .remove-team-btn {
        background-color: #4054B5;
        color: white;
        border: none;
        border-radius: 30px;
        padding: 12px 40px;
        font-size: 16px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s;
        display: inline-block;
    }

    .remove-team-btn:hover {
        background-color: #2f3f8f;
        box-shadow: 0 4px 12px rgba(64, 84, 181, 0.4);
        color: white;
        text-decoration: none;
    }

    .remove-team-btn:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
        opacity: 0.6;
    }

    .remove-team-btn:disabled:hover {
        background-color: #cccccc;
        box-shadow: none;
    }

    .checkbox-cell {
        text-align: center;
        width: 80px;
    }

    .team-checkbox {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .teams-table {
        margin-top: 40px;
        width: 100%;
        border-collapse: collapse;
    }

    .teams-table thead {
        background-color: #f5f5f5;
    }

    .teams-table th {
        text-align: left;
        padding: 15px 20px;
        font-weight: bold;
        font-size: 18px;
        color: #000;
        border-bottom: 2px solid #000;
    }

    .teams-table td {
        padding: 15px 20px;
        font-size: 16px;
        color: #000;
        border-bottom: 1px solid #ddd;
    }

    .teams-table tr:hover {
        background-color: #f9f9f9;
    }

    .team-name-cell {
        font-weight: 500;
    }

    .admins-cell {
        color: #333;
    }

    .no-teams {
        text-align: center;
        padding: 40px;
        color: #999;
        font-size: 18px;
    }
</style>

<div class="page-header">
    <h1 class="page-title">@(role == "SuperAdmin" ? "Teams Management" : "Team Management")</h1>
    <div class="button-group">
        @if (role == "SuperAdmin")
        {
            <a href="/Team/Create" class="add-team-btn">Add Team</a>
            <button id="removeTeamBtn" class="remove-team-btn" disabled onclick="window.location.href='/Team/Remove'">Remove Team</button>
        }
        else
        {
            <a href="/Team/AddMember" class="add-team-btn">Add Team Member</a>
            <a href="/Team/RemoveMember" class="remove-team-btn">Remove Team Member</a>
        }
    </div>
</div>

@if (!Model.Any())
{
    <div class="no-teams">
        <p>No teams yet. Create your first team to get started!</p>
    </div>
}
else
{
    <table class="teams-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>@(role == "SuperAdmin" ? "Admins" : "Team Members")</th>
                @if (role == "SuperAdmin")
                {
                    <th class="checkbox-cell">Select</th>
                }
            </tr>
        </thead>
        <tbody>
            @foreach (var team in Model.OrderBy(t => t.Name))
            {
                @if (role == "SuperAdmin")
                {
                    @* SuperAdmin view: Show team admins *@
                    var teamAdminsList = ((List<StudentManagement.Models.TeamAdmin>)ViewBag.TeamAdmins)
                        .Where(a => a.TeamId == team.Id)
                        .ToList();

                    var adminNames = string.Join(", ", teamAdminsList.Select(a => a.Name));

                    <tr>
                        <td class="team-name-cell">@team.Name</td>
                        <td class="admins-cell">@adminNames</td>
                        <td class="checkbox-cell">
                            <input type="checkbox" class="team-checkbox" value="@team.Id" onchange="updateRemoveButtonState()" />
                        </td>
                    </tr>
                }
                else
                {
                    @* TeamAdmin view: Show team members (students) *@
                    var teamStudents = ((List<StudentManagement.Models.Student>)ViewBag.Students)
                        .Where(s => s.TeamId == team.Id)
                        .ToList();

                    var memberNames = string.Join(", ", teamStudents.Select(s => s.Name));

                    <tr>
                        <td class="team-name-cell">@team.Name</td>
                        <td class="admins-cell">@memberNames</td>
                    </tr>
                }
            }
        </tbody>
    </table>

    @if (role == "SuperAdmin")
    {
        <script>
            function updateRemoveButtonState() {
                const checkboxes = document.querySelectorAll('.team-checkbox');
                const removeBtn = document.getElementById('removeTeamBtn');
                const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
                removeBtn.disabled = !anyChecked;
            }
        </script>
    }
}
