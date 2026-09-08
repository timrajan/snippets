@model YourApp.Models.StudentSearchViewModel
@{
    ViewData["Title"] = "Students";
}

<div class="d-flex flex-wrap align-items-baseline justify-content-between mb-3">
    <h1 class="h4 mb-0">Students</h1>
    <span class="text-secondary small">
        @if (Model.TotalCount == 0)
        {
            <text>No results</text>
        }
        else
        {
            <text>Showing @Model.FirstRowOnPage&ndash;@Model.LastRowOnPage of @Model.TotalCount</text>
        }
    </span>
</div>

@* Collapse toggle, visible below the lg breakpoint only.
   Uses Bootstrap's own collapse plugin from bootstrap.bundle.min.js. *@
<button class="btn btn-outline-secondary w-100 mb-2 d-lg-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#filterPanel"
        aria-expanded="false"
        aria-controls="filterPanel">
    Filters
    @if (Model.HasAnyFilter)
    {
        <span class="badge text-bg-primary ms-1">on</span>
    }
</button>

@* `collapse d-lg-block`: hidden and toggleable on small screens, always
   visible on large ones. The !important in d-lg-block beats .collapse. *@
<div class="collapse d-lg-block" id="filterPanel">
    <form method="get" asp-controller="Students" asp-action="Index" class="mb-3">
        <div class="row g-2">
            <div class="col-12 col-md-6 col-lg-3">
                <div class="py-1 form-floating mb-2">
                    <input asp-for="Name"
                           class="form-control @(Model.Focus == "name" ? "border-primary" : "")"
                           placeholder="Name"
                           @(Model.Focus == "name" ? Html.Raw("autofocus") : null) />
                    <label asp-for="Name">Name</label>
                </div>
            </div>

            <div class="col-12 col-md-6 col-lg-3">
                <div class="py-1 form-floating mb-2">
                    <input asp-for="RollNumber"
                           type="number"
                           class="form-control @(Model.Focus == "roll" ? "border-primary" : "")"
                           placeholder="Roll number"
                           @(Model.Focus == "roll" ? Html.Raw("autofocus") : null) />
                    <label asp-for="RollNumber">Roll number</label>
                </div>
            </div>

            <div class="col-12 col-md-6 col-lg-2">
                <div class="py-1 form-floating mb-2">
                    <select asp-for="Year"
                            asp-items="Model.Years"
                            class="form-select @(Model.Focus == "year" ? "border-primary" : "")"
                            @(Model.Focus == "year" ? Html.Raw("autofocus") : null)>
                        <option value="">All years</option>
                    </select>
                    <label asp-for="Year">Year</label>
                </div>
            </div>

            <div class="col-12 col-md-6 col-lg-2">
                <div class="py-1 form-floating mb-2">
                    <select asp-for="Gender"
                            asp-items="Model.Genders"
                            class="form-select @(Model.Focus == "gender" ? "border-primary" : "")"
                            @(Model.Focus == "gender" ? Html.Raw("autofocus") : null)>
                        <option value="">All</option>
                    </select>
                    <label asp-for="Gender">Gender</label>
                </div>
            </div>

            <div class="col-12 col-lg-2 d-flex align-items-center gap-2 pb-2">
                <button type="submit" class="btn btn-primary flex-fill">Search</button>
                <a asp-action="Index" class="btn btn-outline-secondary">Clear</a>
            </div>
        </div>
    </form>
</div>

@* Active filter chips. Each is a plain link back to the same action with
   that one filter dropped — no JavaScript involved. *@
@if (Model.HasAnyFilter)
{
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
        <span class="text-secondary small">Filters</span>

        @if (!string.IsNullOrWhiteSpace(Model.Name))
        {
            <a class="badge rounded-pill text-bg-light text-decoration-none border"
               asp-action="Index" asp-all-route-data="Model.RouteValuesWithout("Name")">
                Name: @Model.Name <span aria-hidden="true">&times;</span>
            </a>
        }
        @if (Model.RollNumber is not null)
        {
            <a class="badge rounded-pill text-bg-light text-decoration-none border"
               asp-action="Index" asp-all-route-data="Model.RouteValuesWithout("RollNumber")">
                Roll no: @Model.RollNumber <span aria-hidden="true">&times;</span>
            </a>
        }
        @if (Model.Year is not null)
        {
            <a class="badge rounded-pill text-bg-light text-decoration-none border"
               asp-action="Index" asp-all-route-data="Model.RouteValuesWithout("Year")">
                Year @Model.Year <span aria-hidden="true">&times;</span>
            </a>
        }
        @if (!string.IsNullOrWhiteSpace(Model.Gender))
        {
            <a class="badge rounded-pill text-bg-light text-decoration-none border"
               asp-action="Index" asp-all-route-data="Model.RouteValuesWithout("Gender")">
                @Model.Gender <span aria-hidden="true">&times;</span>
            </a>
        }
    </div>
}

@if (Model.Rows.Count == 0)
{
    <div class="text-center py-5 border rounded">
        <p class="mb-2">No students match these filters.</p>
        <a asp-action="Index" class="btn btn-outline-secondary btn-sm">Show all students</a>
    </div>
}
else
{
    <div class="table-responsive">
        <table class="table table-hover align-middle">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col" class="d-none d-md-table-cell">Roll number</th>
                    <th scope="col">Year</th>
                    <th scope="col" class="d-none d-sm-table-cell">Gender</th>
                    @*
                        Add your remaining columns here — subject selected, etc.
                        Put d-none d-lg-table-cell on the lower-priority ones so
                        they drop away on narrow screens instead of forcing a
                        horizontal scroll.
                    *@
                </tr>
            </thead>
            <tbody>
                @foreach (var row in Model.Rows)
                {
                    <tr>
                        <td>
                            @row.Name
                            @* Columns hidden at this width, folded under the name
                               so nothing is lost on a phone. *@
                            <div class="small text-secondary d-md-none">
                                @row.RollNumber &middot; @row.Gender
                            </div>
                        </td>
                        <td class="d-none d-md-table-cell font-monospace small">@row.RollNumber</td>
                        <td>Year @row.Year</td>
                        <td class="d-none d-sm-table-cell">@row.Gender</td>
                    </tr>
                }
            </tbody>
        </table>
    </div>

    @if (Model.TotalPages > 1)
    {
        <nav aria-label="Student pages">
            <ul class="pagination justify-content-center flex-wrap">
                <li class="page-item @(Model.HasPrevious ? "" : "disabled")">
                    <a class="page-link" asp-action="Index"
                       asp-all-route-data="Model.RouteValues(Model.Page - 1)">Previous</a>
                </li>

                @for (var p = Model.StartPage; p <= Model.EndPage; p++)
                {
                    <li class="page-item @(p == Model.Page ? "active" : "")">
                        <a class="page-link" asp-action="Index"
                           asp-all-route-data="Model.RouteValues(p)">@p</a>
                    </li>
                }

                <li class="page-item @(Model.HasNext ? "" : "disabled")">
                    <a class="page-link" asp-action="Index"
                       asp-all-route-data="Model.RouteValues(Model.Page + 1)">Next</a>
                </li>
            </ul>
        </nav>
    }
}
