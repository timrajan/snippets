$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$log  = "C:\jobs\move_rows.log"
$csv  = "C:\jobs\transfer.csv"
$ids  = "C:\jobs\transfer_ids.txt"

"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - run started" | Add-Content $log

# 1. Capture IDs of Success rows that haven't been transferred yet
& $psql -w -h localhost -U your_user -d ABC -t -A -c "SELECT id FROM abc WHERE status = 'Success' AND transferred_at IS NULL" | Set-Content $ids

$idList = (Get-Content $ids | Where-Object { $_ -match '\d' }) -join ','

if ($idList) {
    # 2. Copy those rows out — exclude the marker column so it matches xyz's schema
    & $psql -w -h localhost -U your_user -d ABC -c "\copy (SELECT id, name, status FROM abc WHERE id IN ($idList)) TO '$csv' WITH CSV"

    # 3. Insert into xyz
    & $psql -w -h localhost -U your_user -d XYZ -c "\copy xyz FROM '$csv' WITH CSV"

    # 4. Mark as transferred only if insert succeeded (rows stay in abc)
    if ($LASTEXITCODE -eq 0) {
        & $psql -w -h localhost -U your_user -d ABC -c "UPDATE abc SET transferred_at = NOW() WHERE id IN ($idList)"
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - copied rows: $idList" | Add-Content $log
    } else {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - INSERT FAILED, will retry next run: $idList" | Add-Content $log
    }
} else {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - nothing to copy" | Add-Content $log
}

Remove-Item $csv, $ids -ErrorAction SilentlyContinue


$pgpassDir = "C:\Windows\System32\config\systemprofile\AppData\Roaming\postgresql"
New-Item -ItemType Directory -Path $pgpassDir -Force

@"
localhost:5432:ABC:your_user:your_pass
localhost:5432:XYZ:your_user:your_pass
"@ | Set-Content "$pgpassDir\pgpass.conf" -Encoding ASCII

# Lock it down so only SYSTEM and Administrators can read it
icacls "$pgpassDir\pgpass.conf" /inheritance:r /grant "SYSTEM:R" /grant "Administrators:F"

powershell -ExecutionPolicy Bypass -File C:\jobs\MoveSuccessRows.ps1
Get-Content C:\jobs\move_rows.log -Tail 2
