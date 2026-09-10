<button type="button" class="btn btn-sm btn-outline-secondary edit-comment"
            data-bs-toggle="modal" data-bs-target="#commentModal"
            data-id="@row.Id"
            data-name="@row.Name"
            data-comment="@row.Comment"
            title="Edit comment">
        <i class="bi bi-pencil"></i>
    </button>


                        [HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> UpdateComment(
    long rollNumber, string? comment, StudentSearchViewModel filters)
{
    if (rollNumber == 0)
    {
        TempData["Error"] = "Cannot add a comment to a student without a roll number";
        return RedirectToAction(nameof(ViewStudents), filters.RouteValues(filters.Page));
    }

    var students = await _context.TestData
        .Where(s => s.RollNumber == rollNumber)
        .ToListAsync();

    if (students.Count == 0)
        return NotFound();

    foreach (var s in students)
        s.Comment = comment;

    await _context.SaveChangesAsync();

    TempData["Saved"] = students.Count == 1
        ? "Comment updated"
        : $"Comment updated on {students.Count} rows";

    return RedirectToAction(nameof(ViewStudents), filters.RouteValues(filters.Page));
}
