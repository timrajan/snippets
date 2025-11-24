# Validate required variables
if ([string]::IsNullOrEmpty("$(PAT)")) {
    Write-Error "##vso[task.logissue type=error]PAT is required but was not provided!"
    exit 1
}

if ([string]::IsNullOrEmpty("$(Organization)")) {
    Write-Error "##vso[task.logissue type=error]Organization is required but was not provided!"
    exit 1
}

# Create the authentication header
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$(PAT)"))
$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Content-Type"  = "application/json"
}

# Test the PAT by calling a simple API endpoint
$uri = "https://dev.azure.com/$(Organization)/_apis/connectionData"

try {
    Write-Host "Validating Azure PAT..."
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ErrorAction Stop
    
    Write-Host "✓ PAT is valid!"
    Write-Host "  Authenticated User: $($response.authenticatedUser.providerDisplayName)"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    switch ($statusCode) {
        401 { Write-Error "##vso[task.logissue type=error]PAT is invalid or expired!" }
        403 { Write-Error "##vso[task.logissue type=error]PAT does not have sufficient permissions!" }
        404 { Write-Error "##vso[task.logissue type=error]Organization '$(Organization)' not found!" }
        default { Write-Error "##vso[task.logissue type=error]Validation failed: $($_.Exception.Message)" }
    }
    exit 1
}
