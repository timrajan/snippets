if ([string]::IsNullOrEmpty("$(YourVariableName)")) {
    Write-Error "YourVariableName is required!"
    exit 1
}
