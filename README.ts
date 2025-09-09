-- IF_FUNC: Excel-style IF function
CREATE OR REPLACE FUNCTION IF_FUNC(condition BOOLEAN, value_if_true TEXT, value_if_false TEXT)
RETURNS TEXT AS $$
BEGIN
    IF condition IS NULL THEN RETURN value_if_false; END IF;
    IF condition THEN RETURN value_if_true; ELSE RETURN value_if_false; END IF;
END;
$$ LANGUAGE plpgsql;

-- TEXT_FUNC: Format number/date as text with specified format
CREATE OR REPLACE FUNCTION TEXT_FUNC(input_value TEXT, format_string TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_value IS NULL THEN RETURN ''; END IF;
    -- Simplified implementation
    RETURN input_value::TEXT;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_dds_formulas()
RETURNS TRIGGER AS $$
BEGIN
    -- Excel: IF(ISBLANK(E6),"",TEXT(E6,"yyyy,mm,dd"))
    NEW.DOBString = IF_FUNC(ISBLANK(NEW.DOB), '', TEXT_FUNC(NEW.DOB,'yyyy,mm,dd'));
