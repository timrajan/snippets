
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



            <!-- Comments field - full width -->
            <div class="comments-row">
                <label for="Comments">Comments<span class="required">*</span></label>
                <textarea id="Comments" name="Comments" maxlength="200" placeholder="Maximum 200 characters">@Model?.Comments</textarea>
            </div>
