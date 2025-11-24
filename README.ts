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
    
    # Additional validation - check if we got actual user data back
    $authenticatedUser = $response.authenticatedUser.providerDisplayName
    $userId = $response.authenticatedUser.id
    
    if ([string]::IsNullOrEmpty($authenticatedUser) -or [string]::IsNullOrEmpty($userId)) {
        Write-Error "PAT is invalid! No authenticated user returned."
        exit 1
    }
    
    # Check if it's an anonymous/public response (invalid PAT)
    if ($response.authenticatedUser.isContainer -eq $true -or $authenticatedUser -eq "Anonymous") {
        Write-Error "PAT is invalid! Received anonymous/unauthenticated response."
        exit 1
    }
    
    Write-Host "✓ PAT is valid!" -ForegroundColor Green
    Write-Host "  Authenticated User: $authenticatedUser"
    Write-Host "  User ID: $userId"
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    switch ($statusCode) {
        401 { Write-Error "PAT is invalid or expired!" }
        403 { Write-Error "PAT does not have sufficient permissions!" }
        404 { Write-Error "Organization '$Organization' not found!" }
        default { Write-Error "Validation failed: $($_.Exception.Message)" }
    }
    exit 1
}
