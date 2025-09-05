pg_ctl -D C:\PostgreSQL\data -l C:\PostgreSQL\logs\server.log start


Add C:\PostgreSQL\bin to your system PATH
Set PGDATA=C:\PostgreSQL\data environment variable


Create a User Password:


cmd
psql -U postgres
ALTER USER postgres PASSWORD 'yourpassword';
\q


Running as Windows Service (Recommended)
Register PostgreSQL as a Windows service so it starts automatically:


cmd
pg_ctl register -N postgresql -D C:\PostgreSQL\data


To start/stop the service:


cmd
net start postgresql
net stop postgresql


Stop server:


cmd
pg_ctl -D C:\PostgreSQL\data stop
Check if server is running:


cmd
pg_ctl -D C:\PostgreSQL\data status
