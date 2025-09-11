-- CODE: Get ASCII value of first character
CREATE OR REPLACE FUNCTION CODE(input_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF input_text IS NULL OR LENGTH(input_text) = 0 THEN RETURN NULL; END IF;
    RETURN ASCII(LEFT(input_text, 1));
END;
$$ LANGUAGE plpgsql;
