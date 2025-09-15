
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
