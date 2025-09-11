CREATE OR REPLACE FUNCTION EXCEL_ROW(table_name TEXT, current_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    current_row_num INTEGER;
    sql_query TEXT;
BEGIN
    -- Get the row number of the specified row
    sql_query := format('SELECT COUNT(*) + 1 FROM %I WHERE id < $1', table_name);
    RAISE NOTICE 'Query: %', sql_query;
    EXECUTE sql_query USING current_id INTO current_row_num;
    
    RETURN current_row_num;
END;
$$ LANGUAGE plpgsql;
