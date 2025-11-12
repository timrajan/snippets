New-NetFirewallRule -DisplayName "Allow IIS HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
