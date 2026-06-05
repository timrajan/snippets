- task: PowerShell@2
  displayName: 'Point jest-puppeteer at build proxy'
  inputs:
    targetType: inline
    script: |
      $file = "jest-puppeteer.config.js"
      (Get-Content $file -Raw) `
        -replace '--proxy-server=[^''"]+', '--proxy-server=$(BUILD_PROXY)' `
        | Set-Content $file
      Write-Host "Config after override:"
      Get-Content $file
