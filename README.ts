ALTER DATABASE old_name RENAME TO new_name;

SELECT pid, usename, application_name FROM pg_stat_activity WHERE datname = 'old_name';

SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'old_name';
