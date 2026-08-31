public class RegionOptions
{
    public List<RegionItem> Regions { get; set; } = new();
}

// Program.cs
builder.Services.Configure<RegionOptions>(builder.Configuration);
