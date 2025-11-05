
@if (TempData["ErrorMessage"] != null)
{
    <div style="background-color: #f8d7da; color: #721c24; padding: 15px; margin: 20px auto; max-width: 900px; border: 1px solid #f5c6cb; border-radius: 4px; text-align: center;">
        <strong>@TempData["ErrorMessage"]</strong>
    </div>
}
