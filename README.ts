
-- TEXT_COMPARE_FUNC: Compares two text snippets for equality
CREATE OR REPLACE FUNCTION TEXT_COMPARE_FUNC(text1 TEXT, text2 TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Handle NULL cases - return false if either is NULL
    IF text1 IS NULL OR text2 IS NULL THEN 
        RETURN FALSE; 
    END IF;
    
    -- Compare the two text values
    RETURN text1 = text2;
END;
$$ LANGUAGE plpgsql;


-- GET_VALUE_FUNC: Get value from specific row and column
CREATE OR REPLACE FUNCTION GET_VALUE_FUNC(
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
        row_number - 1  -- Convert to 0-based offset
    );
    
    -- Execute and get the result
    EXECUTE sql_query INTO result_value;
    
    RETURN result_value;
END;
$$ LANGUAGE plpgsql;
