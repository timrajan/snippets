CREATE OR REPLACE FUNCTION ISNUMBER_FUNC(input_value ANYELEMENT)
RETURNS BOOLEAN AS $
DECLARE
    result_bool BOOLEAN;
    numeric_test NUMERIC;
    input_as_text TEXT;
BEGIN
    -- Convert input to text for processing
    input_as_text := input_value::TEXT;
    
    RAISE NOTICE 'Processing input: % (type: %)', input_as_text, pg_typeof(input_value);
    
    -- Handle NULL case
    IF input_value IS NULL THEN
        RAISE NOTICE 'Input is NULL, returning FALSE';
        RETURN FALSE;
    END IF;
    
    -- Check if input is already a numeric type
    IF pg_typeof(input_value) IN ('integer'::regtype, 'bigint'::regtype, 'numeric'::regtype, 'real'::regtype, 'double precision'::regtype) THEN
        result_bool := TRUE;
        RAISE NOTICE 'Input is already a numeric type: %', pg_typeof(input_value);
    ELSE
        -- Try to cast text to numeric
        BEGIN
            numeric_test := input_as_text::NUMERIC;
            result_bool := TRUE;
            RAISE NOTICE 'Successfully converted text to number: %', numeric_test;
        EXCEPTION
            WHEN invalid_text_representation THEN
                result_bool := FALSE;
                RAISE NOTICE 'Cannot convert to number: %', input_as_text;
            WHEN OTHERS THEN
                result_bool := FALSE;
                RAISE NOTICE 'Other error occurred with input: %', input_as_text;
        END;
    END IF;
    
    RAISE NOTICE 'Result: %', result_bool;
    RETURN result_bool;
END;
$ LANGUAGE plpgsql;
