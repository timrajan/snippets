- task: PowerShell@2
  displayName: 'Point jest-puppeteer at build proxy'
  inputs:
    targetType: inline
    script: |
      $file = "jest-puppeteer.config.js"

      # Rewrite the proxy on the checked-out copy
      (Get-Content $file -Raw) `
        -replace '--proxy-server=[^''"]+', '--proxy-server=$(BUILD_PROXY)' `
        | Set-Content $file

      # Echo the full updated config to the build log
      Write-Host "==================== jest-puppeteer.config.js (after update) ===================="
      Get-Content $file -Raw
      Write-Host "================================================================================="
