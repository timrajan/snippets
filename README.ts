WHERE "id" <> (SELECT MAX("id") FROM "{tableName}")

public static int? MatchFunction(DbContext context,string tableName,string columnName,string lookupValue,int matchType = 1)
{

    
    var sql = $"""
    SELECT position FROM (SELECT "{columnName}",ROW_NUMBER() OVER (ORDER BY "id") AS position FROM "{tableName}") sub WHERE "{columnName}" = @lookupValue LIMIT 1 OFFSET @offset
    """;

    using var command = context.Database.GetDbConnection().CreateCommand();
    command.CommandText = sql;

    var pLookup = command.CreateParameter();
    pLookup.ParameterName = "@lookupValue";

    // Pass the correct type so PostgreSQL doesn't get a string for bigint columns
    if (long.TryParse(lookupValue, out var longVal))
        pLookup.Value = longVal;
    else if (int.TryParse(lookupValue, out var intVal))
        pLookup.Value = intVal;
    else
        pLookup.Value = lookupValue;

    command.Parameters.Add(pLookup);


    //pLookup.Value = lookupValue;
    //command.Parameters.Add(pLookup);

    var pOffset = command.CreateParameter();
    pOffset.ParameterName = "@offset";
    pOffset.Value = Math.Max(0,matchType - 1);
    command.Parameters.Add(pOffset);

    context.Database.OpenConnection();
    try
    {
        var result = command.ExecuteScalar();
        return result == null || result == DBNull.Value
            ? null
            : Convert.ToInt32(result);
    }
    finally
    {
        context.Database.CloseConnection();
    }
}
