public static string? GetValueAtPosition(
    DbContext context,
    string tableName,
    string columnName,
    int position)
{
    if (!IsValidIdentifier(tableName))
        throw new ArgumentException("Invalid table name.", nameof(tableName));
    if (!IsValidIdentifier(columnName))
        throw new ArgumentException("Invalid column name.", nameof(columnName));

    int offset = Math.Max(0, position - 1);

    var sql = $"""
        SELECT CAST("{columnName}" AS TEXT)
        FROM "{tableName}"
        LIMIT 1 OFFSET {offset}
        """;

    using var command = context.Database.GetDbConnection().CreateCommand();
    command.CommandText = sql;

    context.Database.OpenConnection();
    try
    {
        var result = command.ExecuteScalar();
        return result == null || result == DBNull.Value
            ? null
            : result.ToString();
    }
    finally
    {
        context.Database.CloseConnection();
    }
}



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
