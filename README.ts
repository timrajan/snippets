pLookup.ParameterName = "@lookupValue";

// Pass the correct type so PostgreSQL doesn't get a string for bigint columns
if (long.TryParse(lookupValue, out var longVal))
    pLookup.Value = longVal;
else if (int.TryParse(lookupValue, out var intVal))
    pLookup.Value = intVal;
else
    pLookup.Value = lookupValue;

command.Parameters.Add(pLookup);



public int RowFunc(string tableName)
{
    var count = _context.Database
        .SqlQueryRaw<int>($"SELECT COUNT(*) FROM \"{tableName}\"")
        .AsEnumerable()
        .First();
    return count - 1;
}

public int PrevRowFunc(string tableName)
{
    var count = _context.Database
        .SqlQueryRaw<int>($"SELECT COUNT(*) FROM \"{tableName}\"")
        .AsEnumerable()
        .First();
    return count - 2;
}


    var sql = $"""
    SELECT position FROM (SELECT "{columnName}",ROW_NUMBER() OVER (ORDER BY "id") AS position FROM "{tableName}") sub WHERE "{columnName}" = @lookupValue LIMIT 1 OFFSET @offset
    """;
