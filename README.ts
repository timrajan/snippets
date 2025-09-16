-- Simple version that accepts TEXT input (most reliable)
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
