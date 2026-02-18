public static class DbFunctions
{
    // 1. GetValueAtPosition - select column value at a specific position (ordered by ID)
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

        var sql = $"""
            SELECT CAST("{columnName}" AS TEXT)
            FROM "{tableName}"
            LIMIT 1 OFFSET {position - 1}
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

    // 2. MatchFunction - find the position of the nth occurrence of a value
    public static long? MatchFunction(
        DbContext context,
        string tableName,
        string columnName,
        string lookupValue,
        int matchType = 1)
    {
        if (!IsValidIdentifier(tableName))
            throw new ArgumentException("Invalid table name.", nameof(tableName));
        if (!IsValidIdentifier(columnName))
            throw new ArgumentException("Invalid column name.", nameof(columnName));
        if (matchType < 1)
            throw new ArgumentException("Match type must be >= 1.", nameof(matchType));

        var sql = $"""
            SELECT position FROM (
                SELECT "{columnName}",
                       ROW_NUMBER() OVER (ORDER BY "ID") AS position
                FROM "{tableName}"
            ) sub
            WHERE "{columnName}" = @lookupValue
            LIMIT 1 OFFSET @offset
            """;

        using var command = context.Database.GetDbConnection().CreateCommand();
        command.CommandText = sql;

        var pLookup = command.CreateParameter();
        pLookup.ParameterName = "@lookupValue";
        pLookup.Value = lookupValue;
        command.Parameters.Add(pLookup);

        var pOffset = command.CreateParameter();
        pOffset.ParameterName = "@offset";
        pOffset.Value = matchType - 1;
        command.Parameters.Add(pOffset);

        context.Database.OpenConnection();
        try
        {
            var result = command.ExecuteScalar();
            return result == null || result == DBNull.Value
                ? null
                : Convert.ToInt64(result);
        }
        finally
        {
            context.Database.CloseConnection();
        }
    }

    // 3. CountIf - count rows matching criteria, optionally excluding an ID
    public static long CountIf(
        DbContext context,
        string tableName,
        string columnName,
        string criteria,
        int? excludeId = null)
    {
        if (!IsValidIdentifier(tableName))
            throw new ArgumentException("Invalid table name.", nameof(tableName));
        if (!IsValidIdentifier(columnName))
            throw new ArgumentException("Invalid column name.", nameof(columnName));

        var sql = excludeId.HasValue
            ? $"""
                SELECT COUNT(*) FROM "{tableName}"
                WHERE "{columnName}" = @criteria
                AND "ID" <> @excludeId
                """
            : $"""
                SELECT COUNT(*) FROM "{tableName}"
                WHERE "{columnName}" = @criteria
                """;

        using var command = context.Database.GetDbConnection().CreateCommand();
        command.CommandText = sql;

        var pCriteria = command.CreateParameter();
        pCriteria.ParameterName = "@criteria";
        pCriteria.Value = criteria;
        command.Parameters.Add(pCriteria);

        if (excludeId.HasValue)
        {
            var pExclude = command.CreateParameter();
            pExclude.ParameterName = "@excludeId";
            pExclude.Value = excludeId.Value;
            command.Parameters.Add(pExclude);
        }

        context.Database.OpenConnection();
        try
        {
            var result = command.ExecuteScalar();
            return Convert.ToInt64(result);
        }
        finally
        {
            context.Database.CloseConnection();
        }
    }

    // 4. GetValue - select column value at a row number (ordered by CT_ID)
    public static string? GetValue(
        DbContext context,
        string tableName,
        string columnName,
        int rowNumber)
    {
        if (!IsValidIdentifier(tableName))
            throw new ArgumentException("Invalid table name.", nameof(tableName));
        if (!IsValidIdentifier(columnName))
            throw new ArgumentException("Invalid column name.", nameof(columnName));

        var sql = $"""
            SELECT CAST("{columnName}" AS TEXT)
            FROM "{tableName}"
            ORDER BY "CT_ID"
            LIMIT 1 OFFSET @offset
            """;

        using var command = context.Database.GetDbConnection().CreateCommand();
        command.CommandText = sql;

        var pOffset = command.CreateParameter();
        pOffset.ParameterName = "@offset";
        pOffset.Value = rowNumber;
        command.Parameters.Add(pOffset);

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

    // Shared identifier validation
    private static bool IsValidIdentifier(string name)
    {
        return !string.IsNullOrWhiteSpace(name)
            && name.All(c => char.IsLetterOrDigit(c) || c == '_');
    }
}
