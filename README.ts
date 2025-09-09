-- ISBLANK: Check if value is null or empty
CREATE OR REPLACE FUNCTION ISBLANK(input_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN input_value IS NULL OR TRIM(input_value) = '';
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
