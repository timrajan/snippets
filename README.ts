- powershell: |
    Write-Host "=== Windows account running the build ==="
    whoami

    Write-Host "=== jf CLI config (server URL + user) ==="
    jf c show

    Write-Host "=== Identity Artifactory sees for the build's credentials ==="
    jf rt curl -XGET /api/security/users/current

    Write-Host "=== Can this identity see the repo? ==="
    jf rt curl -XGET /api/npm/npm-registry-remote/lodash | Select-Object -First 5
  displayName: 'JFrog identity diagnostics'
  condition: always()
