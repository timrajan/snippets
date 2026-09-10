<div class="modal fade" id="commentModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form method="post" asp-action="UpdateComment">
        @Html.AntiForgeryToken()
        <input type="hidden" name="email" id="commentEmail" />

        @* Carry the current filters so the redirect returns to this same view *@
        <input type="hidden" name="Name" value="@Model.Name" />
        <input type="hidden" name="RollNumber" value="@Model.RollNumber" />
        <input type="hidden" name="Year" value="@Model.Year" />
        <input type="hidden" name="Gender" value="@Model.Gender" />
        <input type="hidden" name="Page" value="@Model.Page" />

        <div class="modal-header">
          <h5 class="modal-title">Comment for <span id="commentStudentName"></span></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <div class="form-floating">
            <textarea name="comment" id="commentText" class="form-control"
                      style="height: 120px" maxlength="500" placeholder=" "></textarea>
            <label for="commentText">Comment</label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    </div>
  </div>
</div>
