$pat = "your-actual-pat"
$pipelineId = 42  # your actual pipeline ID

$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$pat"))
$headers = @{ 
    Authorization = "Basic $base64"
    "Content-Type" = "application/json"
}

$body = @{ 
    resources = @{ 
        repositories = @{ 
            self = @{ 
                refName = "refs/heads/main" 
            } 
        } 
    } 
} | ConvertTo-Json -Depth 5

Write-Host "Testing pipelines URL..."
try {
    $response = Invoke-RestMethod `
        -Uri "https://dev.azure.com/yourorg/yourproject/_apis/pipelines/$pipelineId/runs?api-version=7.1" `
        -Method Post `
        -Headers $headers `
        -Body $body
    Write-Host "SUCCESS: Run ID=$($response.id)"
} catch {
    Write-Host "FAILED: $($_.Exception.Message)"
}
