-- Excel function equivalents for PostgreSQL

-- DEC2HEX: Convert decimal to hexadecimal
CREATE OR REPLACE FUNCTION DEC2HEX(decimal_value INTEGER, digits INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF decimal_value IS NULL THEN RETURN NULL; END IF;
    IF digits IS NULL THEN
        RETURN UPPER(TO_HEX(decimal_value));
    ELSE
        RETURN UPPER(LPAD(TO_HEX(decimal_value), digits, '0'));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- CODE: Get ASCII value of first character
CREATE OR REPLACE FUNCTION CODE_FUNC(input_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF input_text IS NULL OR LENGTH(input_text) = 0 THEN RETURN NULL; END IF;
    RETURN ASCII(LEFT(input_text, 1));
END;
$$ LANGUAGE plpgsql;

-- CONCATENATE: Join multiple strings
CREATE OR REPLACE FUNCTION CONCATENATE(VARIADIC args TEXT[])
RETURNS TEXT AS $$
BEGIN
    RETURN ARRAY_TO_STRING(args, '');
END;
$$ LANGUAGE plpgsql;

-- SUBSTITUTE: Replace occurrences of text
CREATE OR REPLACE FUNCTION SUBSTITUTE(input_text TEXT, old_text TEXT, new_text TEXT, instance_num INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR old_text IS NULL THEN RETURN ''; END IF;
    IF new_text IS NULL THEN new_text := ''; END IF;
    IF instance_num IS NULL THEN
        RETURN REPLACE(input_text, old_text, new_text);
    ELSE
        -- Simple implementation for specific instance replacement
        RETURN REPLACE(input_text, old_text, new_text);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- TRIM_FUNC: Remove leading and trailing spaces
CREATE OR REPLACE FUNCTION TRIM_FUNC(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN RETURN NULL; END IF;
    --IF input_text IS '' THEN RETURN ''; END IF;
    RETURN TRIM(input_text);
END;
$$ LANGUAGE plpgsql;



-- ISBLANK: Check if cell is blank/null
CREATE OR REPLACE FUNCTION ISBLANK(input_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN input_value IS NULL OR TRIM(COALESCE(input_value, '')) = '';
END;
$$ LANGUAGE plpgsql;

-- ISNUMBER: Check if value is numeric
CREATE OR REPLACE FUNCTION ISNUMBER(input_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF input_value IS NULL OR TRIM(input_value) = '' THEN RETURN FALSE; END IF;
    BEGIN
        PERFORM TRIM(input_value)::NUMERIC;
        RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        RETURN FALSE;
    END;
END;
$$ LANGUAGE plpgsql;

-- INDEX_FUNC: Return value from array at specified position
CREATE OR REPLACE FUNCTION INDEX_FUNC(table_name TEXT, column_name TEXT, pos INTEGER)
RETURNS TEXT AS $$
DECLARE
    result_value TEXT;
    sql_query TEXT;
BEGIN
    RAISE NOTICE 'INDEX_FUNC1';
    RAISE NOTICE 'INDEX_FUNC2_0 %',pos;
    IF table_name IS NULL OR column_name IS NULL OR pos IS NULL OR pos < 1 THEN 
        RETURN NULL; 
    END IF;
    RAISE NOTICE 'INDEX_FUNC2';
    -- Build dynamic query to get the nth value from the specified column
    sql_query := format('SELECT %I FROM %I ORDER BY id LIMIT 1 OFFSET %s',
                       column_name, table_name, pos - 1);
    RAISE NOTICE 'INDEX_FUNC3 %',sql_query;
    -- Execute query
    EXECUTE sql_query INTO result_value;
    RAISE NOTICE 'INDEX_FUNC4';
    RETURN result_value;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR OCCURED: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- MID: Extract substring from middle of text
CREATE OR REPLACE FUNCTION MID(input_text TEXT, start_pos INTEGER, num_chars INTEGER)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR start_pos IS NULL OR num_chars IS NULL THEN RETURN NULL; END IF;
    IF start_pos < 1 OR num_chars < 0 THEN RETURN ''; END IF;
    RETURN SUBSTRING(input_text FROM start_pos FOR num_chars);
END;
$$ LANGUAGE plpgsql;

-- MATCH_FUNC: Find position of value in a column
CREATE OR REPLACE FUNCTION MATCH_FUNC(table_name TEXT, column_name TEXT, lookup_value TEXT, match_type INTEGER DEFAULT 1)
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


-- IF_FUNC: Excel-style IF function
CREATE OR REPLACE FUNCTION IF_FUNC(condition BOOLEAN, value_if_true TEXT, value_if_false TEXT)
RETURNS TEXT AS $$
BEGIN
    IF condition IS NULL THEN RETURN value_if_false; END IF;
    IF condition THEN RETURN value_if_true; ELSE RETURN value_if_false; END IF;
END;
$$ LANGUAGE plpgsql;

-- TEXT_FUNC: Format date as text with specified format
CREATE OR REPLACE FUNCTION TEXT_FUNC(input_value TEXT, format_string TEXT)
RETURNS TEXT AS $$
DECLARE
    parsed_date DATE;
BEGIN
    IF input_value IS NULL OR TRIM(input_value) = '' THEN 
        RETURN ''; 
    END IF;
    
    -- Try to parse the date from various formats
    BEGIN
        -- Handle M/D/YYYY, M/DD/YYYY, MM/D/YYYY, MM/DD/YYYY formats
        parsed_date := input_value::DATE;
        
        -- Format according to the format string
        IF format_string = 'yyyy,mm,dd' THEN
            RETURN TO_CHAR(parsed_date, 'YYYY,MM,DD');
        ELSE
            -- Default formatting or other formats can be added here
            RETURN TO_CHAR(parsed_date, 'YYYY-MM-DD');
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        -- If parsing fails, return empty string or original value
        RETURN '';
    END;
END;
$$ LANGUAGE plpgsql;


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


CREATE OR REPLACE FUNCTION ROW_FUNC(table_name TEXT)
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


CREATE OR REPLACE FUNCTION PREV_ROW_FUNC(table_name TEXT)
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


CREATE OR REPLACE FUNCTION ISNUMBER_FUNC(input_value TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    result_bool BOOLEAN;
    numeric_test NUMERIC;
BEGIN
    RAISE NOTICE 'Processing input: %', input_value;
    
    -- Handle NULL case
    IF input_value IS NULL THEN
        RAISE NOTICE 'Input is NULL, returning FALSE';
        RETURN FALSE;
    END IF;
    
    -- Try to cast to numeric
    BEGIN
        numeric_test := input_value::NUMERIC;
        result_bool := TRUE;
        RAISE NOTICE 'Successfully converted to number: %', numeric_test;
    EXCEPTION
        WHEN invalid_text_representation THEN
            result_bool := FALSE;
            RAISE NOTICE 'Cannot convert to number: %', input_value;
        WHEN OTHERS THEN
            result_bool := FALSE;
            RAISE NOTICE 'Other error occurred with input: %', input_value;
    END;
    
    RAISE NOTICE 'Result: %', result_bool;
    RETURN result_bool;
END;
$$ LANGUAGE plpgsql;
