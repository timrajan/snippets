@model StudentManagement.Models.StudyRecord
@{
    ViewData["Title"] = "Edit Student Record";
}

<style>
    h1 {
        text-align: center;
        color: #333;
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 50px;
        letter-spacing: 1px;
    }

    .form-container {
        background-color: white;
        padding: 50px;
        margin: 0 auto;
        max-width: 900px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px 60px;
        margin-bottom: 40px;
    }

    .form-row {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .form-row label {
        min-width: 150px;
        text-align: right;
        font-size: 14px;
        color: #333;
    }

    .required {
        color: red;
        margin-left: 2px;
    }

    .form-row input,
    .form-row select {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #333;
        border-radius: 4px;
        font-size: 14px;
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
    }

    .comments-row {
        margin-top: 30px;
        display: flex;
        align-items: flex-start;
        gap: 20px;
    }

    .comments-row label {
        min-width: 150px;
        text-align: right;
        font-size: 14px;
        color: #333;
        padding-top: 8px;
    }

    .comments-row textarea {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #333;
        border-radius: 4px;
        font-size: 14px;
        font-family: Arial, sans-serif;
        resize: vertical;
        min-height: 80px;
    }

    .submit-container {
        text-align: center;
        margin-top: 40px;
    }

    .submit-btn {
        background-color: white;
        color: #000;
        padding: 12px 40px;
        border: 2px solid #000;
        border-radius: 4px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        letter-spacing: 1px;
    }

    .submit-btn:hover {
        background-color: #f0f0f0;
    }
</style>

<h1>EDIT STUDENT RECORD</h1>

<div class="form-container">
        <form method="post" action="/StudyRecord/Edit/@Model.Id">
            <div class="form-grid">
                <!-- Left column -->
                <div class="form-row">
                    <label for="Team">Team</label>
                    <input type="text" id="Team" name="Team" value="@Model.Team" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="Environment">Environment</label>
                    <input type="text" id="Environment" name="Environment" value="@Model.Environment" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="FirstName">FirstName</label>
                    <input type="text" id="FirstName" name="FirstName" value="@Model.FirstName" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="StudentIQLevel">Student IQ Level</label>
                    <input type="text" id="StudentIQLevel" name="StudentIQLevel" value="@Model.StudentIQLevel" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="MiddleName">MiddleName</label>
                    <input type="text" id="MiddleName" name="MiddleName" value="@Model.MiddleName" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="StudentRollNumber">Student RollNumber</label>
                    <input type="text" id="StudentRollNumber" name="StudentRollNumber" value="@Model.StudentRollNumber" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="LastName">LastName</label>
                    <input type="text" id="LastName" name="LastName" value="@Model.LastName" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="StudentRollName">Student RollName</label>
                    <input type="text" id="StudentRollName" name="StudentRollName" value="@Model.StudentRollName" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="DateOfBirth">Date Of Birth</label>
                    <input type="text" id="DateOfBirth" name="DateOfBirth" value="@Model.DateOfBirth" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="StudentParentEmailAddress">Student Parent Email Address</label>
                    <input type="text" id="StudentParentEmailAddress" name="StudentParentEmailAddress" value="@Model.StudentParentEmailAddress" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="EmailAddress">Email Address</label>
                    <input type="text" id="EmailAddress" name="EmailAddress" value="@Model.EmailAddress" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="Status">Status</label>
                    <input type="text" id="Status" name="Status" value="@Model.Status" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="StudentIdentityID">StudentIdentityID</label>
                    <input type="text" id="StudentIdentityID" name="StudentIdentityID" value="@Model.StudentIdentityID" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="Type">Type</label>
                    <input type="text" id="Type" name="Type" value="@Model.Type" readonly />
                </div>

                <!-- Left column -->
                <div class="form-row">
                    <label for="StudentInitialID">StudentInitialID</label>
                    <input type="text" id="StudentInitialID" name="StudentInitialID" value="@Model.StudentInitialID" readonly />
                </div>

                <!-- Right column -->
                <div class="form-row">
                    <label for="Tags">Tags</label>
                    <input type="text" id="Tags" name="Tags" value="@Model.Tags" readonly />
                </div>
            </div>

            <!-- Comments field - full width - EDITABLE -->
            <div class="comments-row">
                <label for="Comments">Comments<span class="required">*</span></label>
                <textarea id="Comments" name="Comments" maxlength="200" placeholder="Maximum 200 characters">@Model.Comments</textarea>
            </div>

            <div class="submit-container">
                <button type="submit" class="submit-btn">
                    UPDATE STUDY RECORD
                </button>
            </div>
        </form>
    </div>
