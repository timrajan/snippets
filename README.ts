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


-- IF_FUNC: Excel-style IF function
CREATE OR REPLACE FUNCTION IF_FUNC(condition BOOLEAN, value_if_true TEXT, value_if_false TEXT)
RETURNS TEXT AS $$
BEGIN
    IF condition IS NULL THEN RETURN value_if_false; END IF;
    IF condition THEN RETURN value_if_true; ELSE RETURN value_if_false; END IF;
END;
$$ LANGUAGE plpgsql;
