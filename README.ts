InvalidOperationException: The LINQ expression 'DbSet<TAd>() .Where(t => t.Username.Equals( value: __currentUsername_0, comparisonType: OrdinalIgnoreCase))' could not be translated. Additional information: Translation of the 'string.Equals' overload with a 'StringComparison' parameter is not supported. See https://go.microsoft.com/fwlink/?linkid=2129535 for more information. Either rewrite the query in a form that can be translated, or switch to client evaluation explicitly by inserting a call to 'AsEnumerable', 'AsAsyncEnumerable', 'ToList', or 'ToListAsync'. See https://go.microsoft.com/fwlink/?linkid=2101038 for more information.

@{
    ViewData["Title"] = "Add Team Member";
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

    .radio-group {
        display: flex;
        gap: 30px;
        align-items: center;
    }

    .radio-option {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .radio-option input[type="radio"] {
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .radio-option label {
        font-size: 16px;
        color: #000;
        cursor: pointer;
        margin: 0;
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

<h1 class="page-title">Add Team Member</h1>

@if (ViewBag.Error != null)
{
    <div class="error-message">
        @ViewBag.Error
    </div>
}

<form method="post" action="/Team/AddMember" class="form-container">
    <div class="form-row">
        <label for="Name" class="form-label">Name</label>
        <input type="text"
               id="Name"
               name="Name"
               class="form-input"
               required />
    </div>

    <div class="form-row">
        <label class="form-label">Create Access</label>
        <div class="radio-group">
            <div class="radio-option">
                <input type="radio"
                       id="CreateAccessYes"
                       name="CreateAccess"
                       value="Yes"
                       checked />
                <label for="CreateAccessYes">Yes</label>
            </div>
            <div class="radio-option">
                <input type="radio"
                       id="CreateAccessNo"
                       name="CreateAccess"
                       value="No" />
                <label for="CreateAccessNo">No</label>
            </div>
        </div>
    </div>

    <button type="submit" class="create-btn">Create Team Member</button>
</form>
