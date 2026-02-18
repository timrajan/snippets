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
