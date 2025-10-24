# Navigate to PostgreSQL bin folder or add it to PATH
cd "C:\Program Files\PostgreSQL\14\bin"

# Stop the server
pg_ctl stop -D "C:\Program Files\PostgreSQL\14\data"

# Force stop
pg_ctl stop -D "C:\Program Files\PostgreSQL\14\data" -m immediate
