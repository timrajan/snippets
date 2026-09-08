using Microsoft.AspNetCore.Mvc.Rendering;

namespace YourApp.Common;

public static class AppLists
{
    public static class Students
    {
        public static readonly List<SelectListItem> Years = new()
        {
            new SelectListItem("Year 1", "1"),
            new SelectListItem("Year 2", "2"),
            new SelectListItem("Year 3", "3"),
        };

        public static readonly List<SelectListItem> Genders = new()
        {
            new SelectListItem("Female", "Female"),
            new SelectListItem("Male", "Male"),
        };
    }
}


[HttpGet]
public async Task<IActionResult> Index(StudentSearchViewModel vm)
{
    if (vm.Page < 1) vm.Page = 1;

    var query = _context.TestData.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(vm.Name))
    {
        var term = vm.Name.Trim();
        query = query.Where(s => EF.Functions.ILike(s.Name, $"%{term}%"));
    }

    if (!string.IsNullOrWhiteSpace(vm.RollNumber))
    {
        var term = vm.RollNumber.Trim();
        query = query.Where(s => s.RollNumber == term);
    }

    if (vm.Year is not null)
        query = query.Where(s => s.Year == vm.Year);

    if (!string.IsNullOrWhiteSpace(vm.Gender))
        query = query.Where(s => s.Gender == vm.Gender);

    vm.TotalCount = await query.CountAsync();

    if (vm.Page > vm.TotalPages) vm.Page = vm.TotalPages;

    vm.Rows = await query
        .OrderBy(s => s.Name)
        .ThenBy(s => s.Id)
        .Skip((vm.Page - 1) * StudentSearchViewModel.PageSize)
        .Take(StudentSearchViewModel.PageSize)
        .ToListAsync();

    vm.Years = BuildYears();
    vm.Genders = BuildGenders();

    return View(vm);
}

private static IEnumerable<SelectListItem> BuildYears() => new List<SelectListItem>
{
    new SelectListItem("Year 1", "1"),
    new SelectListItem("Year 2", "2"),
    new SelectListItem("Year 3", "3"),
};

private static IEnumerable<SelectListItem> BuildGenders() => new List<SelectListItem>
{
    new SelectListItem("Female", "Female"),
    new SelectListItem("Male", "Male"),
};
