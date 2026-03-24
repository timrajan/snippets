$pat = "your-pat"
$base64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$pat"))

$body = @{ definition = @{ id = YOUR_DEFINITION_ID } } | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://dev.azure.com/{org}/{project}/_apis/build/builds?api-version=7.1" `
  -Method Post `
  -Headers @{ Authorization = "Basic $base64"; "Content-Type" = "application/json" } `
  -Body $body
