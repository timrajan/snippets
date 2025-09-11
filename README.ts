-- Generic COUNTIF function that works with any column name
CREATE OR REPLACE FUNCTION COUNTIF(table_name TEXT, column_name TEXT, criteria TEXT, exclude_id INTEGER DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER := 0;
    sql_query TEXT;
BEGIN
    IF table_name IS NULL OR column_name IS NULL OR criteria IS NULL THEN 
        RETURN 0; 
    END IF;
    
    RAISE NOTICE 'COUNTIF1';
    
    -- Build dynamic query with optional ID exclusion
    IF exclude_id IS NOT NULL THEN
        sql_query := format('SELECT COUNT(*) FROM %I WHERE %I = $1 AND id != $2',
                           table_name, column_name);
        RAISE NOTICE 'Query: %', sql_query;
        EXECUTE sql_query USING criteria, exclude_id INTO count_result;
    ELSE
        sql_query := format('SELECT COUNT(*) FROM %I WHERE %I = $1',
                           table_name, column_name);
        RAISE NOTICE 'Query: %', sql_query;
        EXECUTE sql_query USING criteria INTO count_result;
    END IF;
    
    RAISE NOTICE 'COUNTIF2 - Result: %', count_result;
    
    RETURN COALESCE(count_result, 0);
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR OCCURRED IN COUNTIF: %', SQLERRM;
    RETURN 0;
END;
$$ LANGUAGE plpgsql;
