& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -p 28000 -c "SHOW hba_file;"

On Windows Server, here's exactly what to do:
Find pg_hba.conf
Open PowerShell or cmd and run:
powershellpsql -U postgres -p 28000 -c "SHOW hba_file;"
```

It'll return something like:
```
C:/Program Files/PostgreSQL/16/data/pg_hba.conf
```

If you can't connect at all, browse there manually:
```
C:\Program Files\PostgreSQL\16\data\pg_hba.conf
```
(replace `16` with your version)

---

## Edit the File

Open **Notepad as Administrator** (right-click → Run as administrator), then open the file.

Scroll to the bottom and add:
```
host    all             all             127.0.0.1/32        scram-sha-256
```

If the app is connecting from another machine, replace `127.0.0.1/32` with that machine's IP, e.g.:
```
host    all             all             192.168.1.50/32     scram-sha-256

Reload PostgreSQL
In PowerShell (as Administrator):
powershell# Find the service name first
Get-Service | Where-Object { $_.Name -like "postgresql*" }

# Then restart it (replace with your actual service name)
Restart-Service postgresql-x64-16
Or via Services (services.msc) — find PostgreSQL, right-click → Restart.

Confirm It Worked
powershellpsql -U postgres -p 28000 -c "SELECT 1;"
