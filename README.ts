CREATE OR REPLACE FUNCTION EXCEL_ROW(table_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    current_row_num INTEGER;
    result INTEGER := 0;
    sql_query TEXT;
BEGIN
    -- Get the row number of the current row being inserted/updated
    sql_query := format('SELECT COUNT(*) + 1 INTO current_row_num FROM % WHERE id < NEW.id;',table_name);
    RAISE NOTICE 'Query: %', sql_query;
    EXECUTE sql_query INTO result;
    -- Use current_row_num in your formula
    -- NEW.formula_column := current_row_num * NEW.some_value;  -- Example formula
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
