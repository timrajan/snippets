public static long CountIf(DbContext context,string tableName,string columnName,string criteria,int? excludeId = null)
{
    var sql = excludeId.HasValue
        ? $""" SELECT COUNT(*) FROM "{tableName}" WHERE "{columnName}" = @criteria AND "ID" <> @excludeId """
        : $""" SELECT COUNT(*) FROM "{tableName}" WHERE "{columnName}" = @criteria""";

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
