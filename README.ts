pg_dump -U your_user -d your_database \
  -t table1 -t table2 -t table3 -t table4 -t table5 \
  -F c -f tables.dump


pg_restore -U postgres -d your_existing_db /tmp/tables.dump


C:\Program Files\PostgreSQL\16\bin\
