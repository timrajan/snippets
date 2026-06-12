The root cause is that Azure DevOps pipeline variables are always strings. When the pipeline passed $(myVariable) into your setup.ps1's [bool] parameter, PowerShell received the literal string "true"/"false" and refused to bind it to a [bool].
Change the parameter to [string] and convert inside the script
