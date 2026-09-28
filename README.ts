@{ sql = Get-Content query.sql } | ConvertTo-Json -Depth 3 | Set-Content query.json
