@model List<StudentManagement.Models.Student>
@{
    ViewData["Title"] = "User Management";
}

<style>
    .container {
        max-width: 1400px;
        margin: 30px auto;
        padding: 40px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
        text-align: center;
        color: #2E2B5F;
        margin-bottom: 30px;
        font-size: 32px;
    }

    .users-table-container {
        border: 2px solid #ddd;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 30px;
    }

    .users-table {
        width: 100%;
        border-collapse: collapse;
    }

    .users-table thead {
        border-bottom: 2px solid #ddd;
    }

    .users-table th {
        padding: 15px;
        text-align: left;
        color: #4054B5;
        font-size: 18px;
        font-weight: bold;
    }

    .users-table td {
        padding: 15px;
        border-bottom: 1px solid #eee;
        font-size: 16px;
    }

    .users-table tr:last-child td {
        border-bottom: none;
    }

    .delete-btn {
        background-color: white;
        color: #ff0000;
        border: 2px solid #ff0000;
        padding: 8px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
    }

    .delete-btn:hover {
        background-color: #ff0000;
        color: white;
    }

    .add-user-btn {
        background-color: white;
        color: #4054B5;
        border: 2px solid #4054B5;
        padding: 12px 40px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
    }

    .add-user-btn:hover {
        background-color: #4054B5;
        color: white;
    }

    .no-users {
        text-align: center;
        padding: 40px;
        color: #999;
        font-size: 16px;
    }
</style>

<div class="container">
    <h1>User Management</h1>

    @if (TempData["SuccessMessage"] != null)
    {
        <div style="background-color: #4CAF50; color: white; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center;">
            @TempData["SuccessMessage"]
        </div>
    }

    @if (TempData["ErrorMessage"] != null)
    {
        <div style="background-color: #f44336; color: white; padding: 15px; border-radius: 4px; margin-bottom: 20px; text-align: center;">
            @TempData["ErrorMessage"]
        </div>
    }

    <!-- Users table -->
    <div class="users-table-container">
        @if (Model == null || Model.Count == 0)
        {
            <div class="no-users">
                No users found in your team.
            </div>
        }
        else
        {
            <table class="users-table">
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>User Name</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach (var student in Model)
                    {
                        <tr>
                            <td>User@(student.Id)</td>
                            <td>@student.Name</td>
                            <td>@(student.Role ?? "Team Member")</td>
                            <td>
                                <form method="post" action="/Team/RemoveMember" style="display: inline;" onsubmit="return confirm('Are you sure you want to delete this user?');">
                                    <input type="hidden" name="name" value="@student.Name" />
                                    <button type="submit" class="delete-btn">Delete</button>
                                </form>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        }

        <!-- Add User button -->
        <div style="margin-top: 30px;">
            <a href="/Team/AddMember" class="add-user-btn">ADD USER</a>
        </div>
    </div>
</div>
