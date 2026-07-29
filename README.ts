powershell -ExecutionPolicy Bypass -File C:\jobs\MoveSuccessRows.ps1
Get-Content C:\jobs\move_rows.log -Tail 5
