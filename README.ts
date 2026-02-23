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
