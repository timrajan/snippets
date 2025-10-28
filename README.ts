@model List<StudentManagement.Models.Team>

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

    .teams-table {
        margin-top: 40px;
    }

    .table-header {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 40px;
        margin-bottom: 20px;
    }

    .header-label {
        font-weight: bold;
        font-size: 18px;
        color: #000;
    }

    .team-row {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 40px;
        align-items: center;
        margin-bottom: 20px;
    }

    .team-name {
        font-size: 18px;
        font-weight: 500;
        color: #000;
    }

    .admin-textbox {
        width: 100%;
        max-width: 500px;
        padding: 12px 20px;
        font-size: 16px;
        border: 2px solid #000;
        border-radius: 25px;
        background-color: white;
        color: #000;
        outline: none;
        cursor: default;
    }

    .admin-textbox:focus {
        border-color: #000;
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
            <a href="/Team/Remove" class="remove-team-btn">Remove Team</a>
        }
        else
        {
            <a href="/Team/AddMember" class="add-team-btn">Add Team Member</a>
            <a href="/Team/RemoveMember" class="remove-team-btn">Remove Team Member</a>
        }
    </div>
</div>

@if (Model.Count == 0)
{
    <div class="no-teams">
        <p>No teams yet. Create your first team to get started!</p>
    </div>
}
else
{
    <div class="teams-table">
        <div class="table-header">
            <div class="header-label">Name</div>
            <div class="header-label">@(role == "SuperAdmin" ? "Admins" : "Team Member")</div>
        </div>

        @foreach (var team in Model.OrderBy(t => t.Name))
        {
            @if (role == "SuperAdmin")
            {
                @* SuperAdmin view: Show team admins *@
                var teamAdminsList = ((List<StudentManagement.Models.TeamAdmin>)ViewBag.TeamAdmins)
                    .Where(a => a.TeamId == team.Id)
                    .ToList();

                var adminNames = string.Join(", ", teamAdminsList.Select(a => a.Name));

                <div class="team-row">
                    <div class="team-name">@team.Name</div>
                    <input type="text" class="admin-textbox" value="@adminNames" readonly />
                </div>
            }
            else
            {
                @* TeamAdmin view: Show team members (students) *@
                var teamStudents = ((List<StudentManagement.Models.Student>)ViewBag.Students)
                    .Where(s => s.TeamId == team.Id)
                    .ToList();

                var memberNames = string.Join(", ", teamStudents.Select(s => s.Name));

                <div class="team-row">
                    <div class="team-name">@team.Name</div>
                    <input type="text" class="admin-textbox" value="@memberNames" readonly />
                </div>
            }
        }
    </div>
}
