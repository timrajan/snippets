- powershell: |
    Write-Host "=== Identity ==="
    whoami
    Write-Host "=== Direct (no proxy) ==="
    curl.exe -v https://something.azureedge.net
    Write-Host "=== Through the proxy ==="
    curl.exe -v -x http://YOUR_PROXY:PORT https://something.azureedge.net
    exit 0
  displayName: 'Diagnose azureedge.net access'
  continueOnError: true
