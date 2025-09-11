-- Generic COUNTIF function that works with any column name
CREATE OR REPLACE FUNCTION COUNTIF(table_name TEXT, column_name TEXT, criteria TEXT)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER := 0;
    sql_query TEXT;
BEGIN
    IF column_name IS NULL OR criteria IS NULL THEN RETURN 0; END IF;
    RAISE NOTICE 'COUNTIF1';
    -- Build dynamic query using the provided column name
    -- SELECT COUNT(*) FROM isftestdata WHERE mygovidemailaddress = $1 AND id != $2
    sql_query := format('SELECT COUNT(*) FROM %I WHERE %I = $1 AND id != $2',
                       table_name, column_name);
    RAISE NOTICE '%',sql_query;                   
    RAISE NOTICE 'COUNTIF2';
    -- Execute with parameters
    EXECUTE sql_query USING criteria, NEW.id INTO count_result;

    RETURN COALESCE(count_result, 0);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR OCCURED IN COUNTIF: %', SQLERRM;
    RETURN 0;
END;
$$ LANGUAGE plpgsql;
