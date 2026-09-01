2. RegionItem.cs — one property added:

csharp
public List<string> Groups { get; set; } = new();

3. Your view — replace asp-items with a loop so each option carries its groups:

cshtml
<select id="regionSelect" asp-for="MyViewModel.Region" class="form-select">
    <option value="">-- Select --</option>
    @foreach (var r in RegionOpts.Value.Regions)
    {
        <option value="@r.Code" data-groups="@string.Join(",", r.Groups)">@r.Code</option>
    }
</select>

4. At the bottom of the same view, inside a scripts section:

cshtml
@section Scripts {
    <script>
        $('#groupSelect').on('change', function () {
            var g = $(this).val();
            $('#regionSelect').val('').find('option[data-groups]').each(function () {
                var groups = ($(this).attr('data-groups') || '').split(',');
                $(this).toggle(!g || groups.indexOf(g) !== -1);
            });
        }).trigger('change');
    </script>
}

The script never names a region or a group — it just compares whatever the JSON put in data-groups against whatever the user picked. Add a region to the JSON, or change its groups, and the filtering follows automatically.

Check your layout has @await RenderSectionAsync("Scripts", required: false), or the block won't render. If your id for the group dropdown differs, change the selector.
