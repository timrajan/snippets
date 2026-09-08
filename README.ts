using Microsoft.AspNetCore.Mvc.Rendering;

namespace YourApp.Models;

public class StudentSearchViewModel
{
    public const int PageSize = 50;

    // ---- Filters, bound from the query string ----
    public string? Name { get; set; }
    public string? RollNumber { get; set; }
    public int? Year { get; set; }
    public string? Gender { get; set; }

    // Which tile the user arrived from. Only decides which control gets
    // autofocus and a highlight; it does not filter anything.
    public string? Focus { get; set; }

    public int Page { get; set; } = 1;

    // ---- Populated by the controller ----
    public IReadOnlyList<Student> Rows { get; set; } = Array.Empty<Student>();   // <-- entity type
    public int TotalCount { get; set; }
    public IEnumerable<SelectListItem> Years { get; set; } = Enumerable.Empty<SelectListItem>();
    public IEnumerable<SelectListItem> Genders { get; set; } = Enumerable.Empty<SelectListItem>();

    // ---- Derived paging state ----
    public int TotalPages => TotalCount == 0
        ? 1
        : (int)Math.Ceiling(TotalCount / (double)PageSize);

    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;

    public int FirstRowOnPage => TotalCount == 0 ? 0 : ((Page - 1) * PageSize) + 1;
    public int LastRowOnPage => Math.Min(Page * PageSize, TotalCount);

    // Window of page numbers to render, so 40 pages doesn't mean 40 links.
    public int StartPage => Math.Max(1, Math.Min(Page - 2, TotalPages - 4));
    public int EndPage => Math.Min(TotalPages, Math.Max(Page + 2, 5));

    public bool HasAnyFilter =>
        !string.IsNullOrWhiteSpace(Name)
        || !string.IsNullOrWhiteSpace(RollNumber)
        || Year is not null
        || !string.IsNullOrWhiteSpace(Gender);

    /// <summary>
    /// Current filters plus a target page, for asp-all-route-data on the
    /// pagination links. Without this, clicking page 2 drops the filters.
    /// </summary>
    public Dictionary<string, string> RouteValues(int page)
    {
        var values = new Dictionary<string, string>();

        if (!string.IsNullOrWhiteSpace(Name)) values["Name"] = Name;
        if (!string.IsNullOrWhiteSpace(RollNumber)) values["RollNumber"] = RollNumber;
        if (Year is not null) values["Year"] = Year.Value.ToString();
        if (!string.IsNullOrWhiteSpace(Gender)) values["Gender"] = Gender;

        if (page > 1) values["Page"] = page.ToString();

        return values;
    }

    /// <summary>
    /// Same filters minus one, for the dismissible filter chips.
    /// </summary>
    public Dictionary<string, string> RouteValuesWithout(string key)
    {
        var values = RouteValues(1);
        values.Remove(key);
        return values;
    }
}
