CREATE OR REPLACE FUNCTION ROW_FUNC(table_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_row_num INTEGER;
    sql_query TEXT;
BEGIN
    sql_query := format('SELECT COUNT(*) + 1 FROM %I', table_name);
    EXECUTE sql_query INTO next_row_num;
    RETURN next_row_num;
END;
$$ LANGUAGE plpgsql;
