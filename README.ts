-- Simple debug message
DO $$ BEGIN RAISE NOTICE 'Debug: Starting my query'; END; $$;

-- Debug with variables
DO $$ 
DECLARE 
    my_table TEXT := 'users';
BEGIN 
    RAISE NOTICE 'About to query table: %', my_table; 
END; 
$$;

-- Your actual query
SELECT * FROM users WHERE active = true;

-- Another debug message
DO $$ BEGIN RAISE NOTICE 'Query completed successfully'; END; $$;
