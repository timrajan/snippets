CREATE OR REPLACE FUNCTION INDEX_FUNC(table_name TEXT, column_name TEXT, position INTEGER)
RETURNS TEXT AS $$
DECLARE
    result_value TEXT;
    sql_query TEXT;
BEGIN
    RAISE NOTICE 'INDEX_FUNC1';
    IF table_name IS NULL OR column_name IS NULL OR position IS NULL OR position < 1 THEN 
        RETURN NULL; 
    END IF;
    RAISE NOTICE 'INDEX_FUNC2';
    -- Build dynamic query to get the nth value from the specified column
    sql_query := format('SELECT %I FROM %I ORDER BY id LIMIT 1 OFFSET %s',
                       column_name, table_name, position - 1);
    RAISE NOTICE 'INDEX_FUNC3';
    -- Execute query
    EXECUTE sql_query INTO result_value;
    RAISE NOTICE 'INDEX_FUNC4';
    RETURN result_value;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
