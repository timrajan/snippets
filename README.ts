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
        .Select(s => new StudentRowDto(
            s.Id, s.Name, s.RollNumber, s.Year, s.Gender, s.Status))
        .ToListAsync();

    vm.Years = await BuildYearsAsync();
    vm.Genders = BuildGenders();

    return View(vm);
}

private async Task<IEnumerable<SelectListItem>> BuildYearsAsync()
{
    var years = await _context.TestData
        .AsNoTracking()
        .Select(s => s.Year)
        .Distinct()
        .OrderBy(y => y)
        .ToListAsync();

    return years.Select(y => new SelectListItem($"Year {y}", y.ToString()));
}

private static IEnumerable<SelectListItem> BuildGenders() =>
[
    new SelectListItem("Female", "Female"),
    new SelectListItem("Male", "Male"),
];
