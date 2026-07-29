$idsRaw = & $psql -w -h localhost -U your_user -d ABC -t -A -c "SELECT id FROM abc WHERE status = 'Success' AND transferred_at IS NULL" 2>&1
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - step1 exit=$LASTEXITCODE raw: $idsRaw" | Add-Content $log
$idList = ($idsRaw | Where-Object { $_ -match '^\d+$' }) -join ','

$env:PGPASSWORD = (Get-Content "C:\jobs\pgpassword.txt" -Raw).Trim()
