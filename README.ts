Get-ChildItem "C:\inetpub" -Recurse | Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)} | Select-Object FullName, LastWriteTime
