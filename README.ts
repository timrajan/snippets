results = allRecords
    .Where(r => r.emailaddress != null)
    .Select(g =>
    {
        var types = g.Select(r => r.mytype).Distinct().ToList();

        return new myModel
        {
            RowCount = g.Count(),
            myTypes = types.Count == 1 ? "NA" : string.Join(", ", types),
            Status = string.Join(", ", g.Select(r => r.status).Distinct()),
        };
    })
    .Take(5)
    .ToList();



.Select(g =>
{
    var types = string.Join(", ", g.Select(r => r.mytype).Distinct());

    return new myModel
    {
        RowCount = g.Count(),
        myTypes = types.Length == 1 ? "NA" : types,
        Status = string.Join(", ", g.Select(r => r.status).Distinct()),
    };
})
