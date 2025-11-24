# Set your values here for local testing
$PAT = "your-pat-token-here"
$Organization = "your-org-name"

# Validate required variables
if ([string]::IsNullOrEmpty($PAT)) {
    Write-Error "PAT is required but was not provided!"
    exit 1
}

if ([string]::IsNullOrEmpty($Organization)) {
    Write-Error "Organization is required but was not provided!"
    exit 1
}

# Create the authentication header
$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$PAT"))
$headers = @{
    "Authorization" = "Basic $base64Auth"
    "Content-Type"  = "application/json"
}

# Test the PAT by calling a simple API endpoint
$uri = "https://dev.azure.com/$Organization/_apis/connectionData"

try {
    Write-Host "Validating Azure PAT..."
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get -ErrorAction Stop
    
    Write-Host "✓ PAT is valid!" -ForegroundColor Green
    Write-Host "  Authenticated User: $($response.authenticatedUser.providerDisplayName)"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    switch ($statusCode) {
        401 { Write-Error "PAT is invalid or expired!" }
        403 { Write-Error "PAT does not have sufficient permissions!" }
        404 { Write-Error "Organization '$Organization' not found!" }
        default { Write-Error "Validation failed: $($_.Exception.Message)" }
    }
}
