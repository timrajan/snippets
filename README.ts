ALTER DATABASE testdata WITH ALLOW_CONNECTIONS false;
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'testdata';
CREATE DATABASE proddata WITH TEMPLATE testdata OWNER postgres;
ALTER DATABASE testdata WITH ALLOW_CONNECTIONS true;
