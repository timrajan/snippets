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
    pOffset.Value = rowNumber.Value;
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



CREATE OR REPLACE FUNCTION MATCH_FUNC(table_name TEXT, column_name TEXT, lookup_value TEXT, match_type INTEGER DEFAULT 1)  --TODO
RETURNS INTEGER AS $$
DECLARE
    result_position INTEGER;
    sql_query TEXT;
BEGIN
    RAISE NOTICE 'CALLING1  MATCH_FUNC';
    IF table_name IS NULL OR column_name IS NULL OR lookup_value IS NULL THEN 
        RETURN NULL; 
    END IF;
    
    -- Build dynamic query to find the position of the value in the specified column
    -- Using ROW_NUMBER() to get the position
    sql_query := format('
        SELECT position FROM (
            SELECT ROW_NUMBER() OVER (ORDER BY id) as position, %I as col_value
            FROM %I
        ) t WHERE t.col_value = $1 LIMIT 1',
        column_name, table_name);

    -- Execute query
    RAISE NOTICE 'CALLING2 %',sql_query;
    EXECUTE sql_query USING lookup_value INTO result_position;
    RAISE NOTICE 'CALLING3';
    RAISE NOTICE 'Result %',result_position;
    RETURN result_position;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR OCCURED: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


-- GET_VALUE_FUNC: Get value from specific row and column
CREATE OR REPLACE FUNCTION GET_VALUE_FUNC(    --TODO
    table_name TEXT, 
    column_name TEXT, 
    row_number INTEGER
)
RETURNS TEXT AS $$
DECLARE
    result_value TEXT;
    sql_query TEXT;
BEGIN
    -- Build dynamic SQL query with LIMIT and OFFSET
    sql_query := format(
        'SELECT %I FROM %I ORDER BY ctid LIMIT 1 OFFSET %s', 
        column_name, 
        table_name, 
        row_number  -- Convert to 0-based offset
    );
    RAISE NOTICE 'SQL QUERY GET_VALUE_FUNC : %', sql_query;
    -- Execute and get the result
    EXECUTE sql_query INTO result_value;
    
    RETURN result_value;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR OCCURED: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION ROW_FUNC(table_name TEXT)   --TODO
RETURNS INTEGER AS $$
DECLARE
    next_row_num INTEGER;
    sql_query TEXT;
BEGIN
    sql_query := format('SELECT COUNT(*) - 1 FROM %I', table_name);
    EXECUTE sql_query INTO next_row_num;
    RETURN next_row_num;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION PREV_ROW_FUNC(table_name TEXT)  --TODO
RETURNS INTEGER AS $$
DECLARE
    next_row_num INTEGER;
    sql_query TEXT;
BEGIN
    sql_query := format('SELECT COUNT(*) - 2 FROM %I', table_name);
    EXECUTE sql_query INTO next_row_num;
    RETURN next_row_num;
END;
$$ LANGUAGE plpgsql;

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
