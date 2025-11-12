@model YourApp.Models.UserViewModel

@{
    ViewData["Title"] = "Create User";
}

<h2>Create User</h2>

<form asp-action="Create" method="post">
    <div asp-validation-summary="ModelOnly" class="text-danger"></div>
    
    <div class="form-group">
        <label asp-for="UserName" class="control-label"></label>
        <input asp-for="UserName" class="form-control" />
        <span asp-validation-for="UserName" class="text-danger"></span>
    </div>

    <div class="form-group">
        <label asp-for="Email" class="control-label"></label>
        <input asp-for="Email" class="form-control" />
        <span asp-validation-for="Email" class="text-danger"></span>
    </div>

    <div class="form-group">
        <label asp-for="Role" class="control-label"></label>
        <select asp-for="Role" asp-items="ViewBag.Roles" class="form-control" id="roleDropdown">
        </select>
        <span asp-validation-for="Role" class="text-danger"></span>
    </div>

    <div class="form-group">
        <label asp-for="Team" class="control-label"></label>
        <select asp-for="Team" asp-items="ViewBag.Teams" class="form-control" id="teamDropdown">
        </select>
        <input type="hidden" id="teamHidden" asp-for="Team" />
        <span asp-validation-for="Team" class="text-danger"></span>
    </div>

    <div class="form-group">
        <button type="submit" class="btn btn-primary">Create</button>
        <a asp-action="Index" class="btn btn-secondary">Cancel</a>
    </div>
</form>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
    
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const roleDropdown = document.getElementById('roleDropdown');
            const teamDropdown = document.getElementById('teamDropdown');
            const teamHidden = document.getElementById('teamHidden');

            // Trigger on page load
            handleRoleChange();

            // Trigger on dropdown change
            roleDropdown.addEventListener('change', handleRoleChange);

            // Keep hidden field in sync when team dropdown changes
            teamDropdown.addEventListener('change', function () {
                if (!teamDropdown.disabled) {
                    teamHidden.value = teamDropdown.value;
                }
            });

            function handleRoleChange() {
                const selectedRole = roleDropdown.value;
                
                if (selectedRole === 'Admin') {
                    // Set team to Leader
                    teamDropdown.value = 'Leader';
                    
                    // Make it readonly (disabled with grayed out appearance)
                    teamDropdown.disabled = true;
                    teamDropdown.style.backgroundColor = '#e9ecef';
                    teamDropdown.style.cursor = 'not-allowed';
                    teamDropdown.style.opacity = '0.6';
                    
                    // Set hidden field so the value gets submitted
                    teamHidden.value = 'Leader';
                } else {
                    // Enable team dropdown for other roles
                    teamDropdown.disabled = false;
                    teamDropdown.style.backgroundColor = '';
                    teamDropdown.style.cursor = '';
                    teamDropdown.style.opacity = '';
                    
                    // Update hidden field
                    teamHidden.value = teamDropdown.value;
                }
            }
        });
    </script>
}

<style>
    .form-group {
        margin-bottom: 1rem;
    }
</style>
