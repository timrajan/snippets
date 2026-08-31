builder.Configuration.AddJsonFile("stateaus.json", optional: false, reloadOnChange: true);

Regions.All = builder.Configuration
    .GetSection("Regions").Get<List<RegionItem>>() ?? new();

if (Regions.All.Count == 0)
    throw new InvalidOperationException("No regions loaded from stateaus.json.");


Then confirm the .csproj entry so the file lands next to your DLL after publish:

xml
<ItemGroup>
  <None Update="stateaus.json" CopyToOutputDirectory="PreserveNewest" />
</ItemGroup>

    




public class RegionOptions
{
    public List<RegionItem> Regions { get; set; } = new();
}

// Program.cs
builder.Services.Configure<RegionOptions>(builder.Configuration);

public class RegionService
{
    private readonly RegionOptions _options;
    public RegionService(IOptionsSnapshot<RegionOptions> options) => _options = options.Value;

    public IReadOnlyList<RegionItem> All => _options.Regions;
    public bool IsValid(string code) => All.Any(r => r.Code == code);
    public SelectList ToSelectList(string? selected = null) =>
        new SelectList(All, nameof(RegionItem.Code), nameof(RegionItem.Name), selected);
}


protected override ValidationResult IsValid(object? value, ValidationContext ctx)
{
    if (value is not string code || string.IsNullOrWhiteSpace(code))
        return ValidationResult.Success!;

    var regions = ctx.GetRequiredService<RegionService>();
    return regions.IsValid(code)
        ? ValidationResult.Success!
        : new ValidationResult($"'{code}' is not a valid region.");
}

@inject RegionService Regions
<select asp-for="SelectedRegion" asp-items="Regions.ToSelectList()" class="form-select">
