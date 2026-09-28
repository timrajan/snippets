@{ sql = Get-Content query.sql -Raw } | ConvertTo-Json | Set-Content query.json -Encoding utf8
