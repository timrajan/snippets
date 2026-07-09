psql -U postgres

-- Kick any active connections to abc
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'abc' AND pid <> pg_backend_pid();

-- Clone it
CREATE DATABASE xyz TEMPLATE abc;


SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'abc' AND pid <> pg_backend_pid();
