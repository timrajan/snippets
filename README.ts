- powershell: |
    whoami
    echo "Identity: $([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)"
  displayName: 'Check running identity'

- script: |
    whoami
    echo %USERDOMAIN%\%USERNAME%
  displayName: 'Check running identity'
