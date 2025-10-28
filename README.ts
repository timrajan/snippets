@model StudentManagement.Models.Team

@{
    ViewData["Title"] = "Add Team";
}

<style>
    .page-title {
        font-size: 32px;
        font-weight: bold;
        color: #000;
        margin-bottom: 60px;
    }

    .form-container {
        max-width: 600px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 40px;
        align-items: center;
        margin-bottom: 40px;
    }

    .form-label {
        font-size: 18px;
        font-weight: 500;
        color: #000;
    }

    .form-input {
        padding: 10px 15px;
        font-size: 16px;
        border: 2px solid #000;
        border-radius: 5px;
        background-color: white;
        color: #000;
        outline: none;
        width: 300px;
    }

    .form-input:focus {
        border-color: #000;
    }

    .create-btn {
        background-color: white;
        color: #000;
        border: 2px solid #000;
        border-radius: 25px;
        padding: 12px 40px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        margin-left: 240px;
        margin-top: 40px;
    }

    .create-btn:hover {
        background-color: #000;
        color: white;
    }

    .error-message {
        background-color: #f44336;
        color: white;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 25px;
    }
</style>

<h1 class="page-title">Add Team</h1>

@if (ViewBag.Error != null)
{
    <div class="error-message">
        @ViewBag.Error
    </div>
}

<form method="post" action="/Team/Create" class="form-container">
    <div class="form-row">
        <label for="Name" class="form-label">Team Name</label>
        <input type="text"
               id="Name"
               name="Name"
               class="form-input"
               value="@Model?.Name"
               required />
    </div>

    <div class="form-row">
        <label for="adminName" class="form-label">Admin Name</label>
        <input type="text"
               id="adminName"
               name="adminName"
               class="form-input"
               required />
    </div>

    <button type="submit" class="create-btn">Create Team</button>
</form>
