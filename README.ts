-- Simple COUNTIF: Count how many values in an array match the criteria
CREATE OR REPLACE FUNCTION COUNTIF(input_array TEXT[], criteria TEXT)
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER := 0;
    i INTEGER;
BEGIN
    IF input_array IS NULL OR criteria IS NULL THEN RETURN 0; END IF;
    
    -- Loop through array and count exact matches
    FOR i IN 1..array_length(input_array, 1) LOOP
        IF input_array[i] = criteria THEN 
            count_result := count_result + 1; 
        END IF;
    END LOOP;
    
    RETURN count_result;
END;
$$ LANGUAGE plpgsql;


IF_FUNC(ISBLANK(email), '', IF(COUNTIF(G1:G4, email) > 0, INDEX_FUNC(S1:S4, MATCH_FUNC(email, G1:G4, 0))))
