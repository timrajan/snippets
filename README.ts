SELECT c.conname,
       c.contype,
       pg_get_constraintdef(c.oid) AS definition
FROM   pg_constraint c
JOIN   pg_class      t ON t.oid = c.conrelid
JOIN   pg_namespace  n ON n.oid = t.relnamespace
WHERE  t.relname = 'testdata'
AND    n.nspname = 'public';
