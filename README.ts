SELECT 'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON ' || event_object_schema || '.' || event_object_table || ';'
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('information_schema', 'pg_catalog');
