**/bin/
**/obj/
**/[Dd]ebug/
**/[Rr]elease/
**/x64/
**/x86/
**/.vs/



##############################################################################
# StepByStep-UpdateAzureTests.ps1
# 
# Purpose: Interactive step-by-step execution of the Azure Test updater
# Usage: Run locally to execute each step manually with full control
##############################################################################

#region Configuration
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step-by-Step Azure Test Updater" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will guide you through each step of the process." -ForegroundColor Yellow
Write-Host "You can execute steps one at a time and inspect results.`n" -ForegroundColor Yellow

# Configuration - Update these values
$config = @{
    PostgresConnectionString = "Host=your-server.postgres.database.azure.com;Port=5432;Database=yourdb;Username=youruser;Password=yourpass;SSL Mode=Require"
    AzureDevOpsOrgUrl = "https://dev.azure.com/your-organization"
    ProjectName = "YourProjectName"
    AzureDevOpsPAT = "your-pat-token-here"
    TestIdsCommaSeparated = "12345,12346"
    SqlQuery = "SELECT ID, Name FROM Student LIMIT 2"
}

# Validate configuration
if ($config.PostgresConnectionString -like "*your-*") {
    Write-Host "⚠️  Please update the configuration values above before running!" -ForegroundColor Red
    Write-Host "Edit the `$config section in this script.`n" -ForegroundColor Yellow
    $continue = Read-Host "Continue with placeholder values? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        exit
    }
}

Write-Host "Configuration loaded:" -ForegroundColor Green
Write-Host "  Organization: $($config.AzureDevOpsOrgUrl)" -ForegroundColor Gray
Write-Host "  Project: $($config.ProjectName)" -ForegroundColor Gray
Write-Host "  Test IDs: $($config.TestIdsCommaSeparated)" -ForegroundColor Gray
Write-Host "  SQL Query: $($config.SqlQuery)`n" -ForegroundColor Gray

#endregion

#region Helper Functions

function Wait-ForUserToContinue {
    param([string]$Message = "Press Enter to continue to the next step...")
    Write-Host "`n$Message" -ForegroundColor Cyan
    Read-Host
}

function Write-StepHeader {
    param(
        [string]$StepNumber,
        [string]$StepName
    )
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "STEP $StepNumber: $StepName" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-SubStep {
    param([string]$Message)
    Write-Host "  → $Message" -ForegroundColor Yellow
}

#endregion

#region Step-by-Step Execution

# Store state across steps
$script:DatabaseConnection = $null
$script:StudentData = @()
$script:AzureHeaders = $null
$script:TestIds = @()
$script:SuccessCount = 0
$script:FailureCount = 0

#--------------------------------------------------
# STEP 1: Install Required Modules
#--------------------------------------------------
Write-StepHeader "1" "Install Required Modules"

Write-SubStep "Checking for Npgsql module..."

if (Get-Module -ListAvailable -Name Npgsql) {
    Write-Host "✓ Npgsql module is already installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Npgsql module not found" -ForegroundColor Yellow
    $install = Read-Host "Would you like to install it now? (Y/n)"
    
    if ($install -eq '' -or $install -eq 'y' -or $install -eq 'Y') {
        Write-SubStep "Installing Npgsql module..."
        try {
            Install-Module -Name Npgsql -Force -Scope CurrentUser -AllowClobber -SkipPublisherCheck
            Write-Host "✓ Npgsql module installed successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "✗ Failed to install Npgsql module: $_" -ForegroundColor Red
            Write-Host "Manual install: Install-Module -Name Npgsql -Force -Scope CurrentUser" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✗ Cannot continue without Npgsql module" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n✓ Module check complete" -ForegroundColor Green
Wait-ForUserToContinue

#--------------------------------------------------
# STEP 2: Connect to PostgreSQL Database
#--------------------------------------------------
Write-StepHeader "2" "Connect to PostgreSQL Database"

Write-SubStep "Connection String: $($config.PostgresConnectionString)"
Write-Host ""

try {
    Write-SubStep "Establishing connection..."
    $script:DatabaseConnection = New-Object Npgsql.NpgsqlConnection($config.PostgresConnectionString)
    $script:DatabaseConnection.Open()
    
    Write-Host "`n✓ Successfully connected to PostgreSQL!" -ForegroundColor Green
    Write-Host "  Database: $($script:DatabaseConnection.Database)" -ForegroundColor Gray
    Write-Host "  Host: $($script:DatabaseConnection.Host)" -ForegroundColor Gray
    Write-Host "  Port: $($script:DatabaseConnection.Port)" -ForegroundColor Gray
    Write-Host "  Server Version: $($script:DatabaseConnection.ServerVersion)" -ForegroundColor Gray
    
    Write-Host "`n📊 Connection Details:" -ForegroundColor Cyan
    Write-Host "  State: $($script:DatabaseConnection.State)" -ForegroundColor Gray
    Write-Host "  Connection Timeout: $($script:DatabaseConnection.ConnectionTimeout) seconds" -ForegroundColor Gray
}
catch {
    Write-Host "`n✗ Failed to connect to PostgreSQL" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify connection string format" -ForegroundColor Gray
    Write-Host "  2. Check firewall rules" -ForegroundColor Gray
    Write-Host "  3. Verify credentials" -ForegroundColor Gray
    Write-Host "  4. Try SSL Mode=Prefer instead of Require" -ForegroundColor Gray
    exit 1
}

Wait-ForUserToContinue

#--------------------------------------------------
# STEP 3: Execute SQL Query
#--------------------------------------------------
Write-StepHeader "3" "Execute SQL Query"

Write-SubStep "Query: $($config.SqlQuery)"
Write-Host ""

try {
    Write-SubStep "Creating command..."
    $command = $script:DatabaseConnection.CreateCommand()
    $command.CommandText = $config.SqlQuery
    
    Write-SubStep "Executing query..."
    $adapter = New-Object Npgsql.NpgsqlDataAdapter($command)
    $dataSet = New-Object System.Data.DataSet
    [void]$adapter.Fill($dataSet)
    
    Write-SubStep "Processing results..."
    $script:StudentData = @()
    foreach ($row in $dataSet.Tables[0].Rows) {
        $script:StudentData += [PSCustomObject]@{
            ID = $row["ID"]
            Name = $row["Name"]
        }
    }
    
    Write-Host "`n✓ Query executed successfully!" -ForegroundColor Green
    Write-Host "  Records retrieved: $($script:StudentData.Count)" -ForegroundColor Gray
    
    if ($script:StudentData.Count -gt 0) {
        Write-Host "`n📊 Sample Data (First 5 records):" -ForegroundColor Cyan
        $script:StudentData | Select-Object -First 5 | Format-Table -AutoSize
    } else {
        Write-Host "`n⚠️  No data returned from query!" -ForegroundColor Yellow
        Write-Host "Please verify:" -ForegroundColor Yellow
        Write-Host "  1. Table 'Student' exists" -ForegroundColor Gray
        Write-Host "  2. Table has data" -ForegroundColor Gray
        Write-Host "  3. Columns 'ID' and 'Name' exist" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "Data Structure:" -ForegroundColor Cyan
    Write-Host "  Column 1: ID (Type: $($script:StudentData[0].ID.GetType().Name))" -ForegroundColor Gray
    Write-Host "  Column 2: Name (Type: $($script:StudentData[0].Name.GetType().Name))" -ForegroundColor Gray
}
catch {
    Write-Host "`n✗ Failed to execute query" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Wait-ForUserToContinue

#--------------------------------------------------
# STEP 4: Close Database Connection
#--------------------------------------------------
Write-StepHeader "4" "Close Database Connection"

Write-SubStep "Closing connection..."

try {
    if ($script:DatabaseConnection -and $script:DatabaseConnection.State -eq 'Open') {
        $script:DatabaseConnection.Close()
        $script:DatabaseConnection.Dispose()
        Write-Host "`n✓ Database connection closed successfully" -ForegroundColor Green
    }
}
catch {
    Write-Host "`n⚠️  Error closing connection: $_" -ForegroundColor Yellow
}

Write-Host "`n💡 Data is cached in memory, database connection no longer needed" -ForegroundColor Cyan
Wait-ForUserToContinue

#--------------------------------------------------
# STEP 5: Prepare Azure DevOps Connection
#--------------------------------------------------
Write-StepHeader "5" "Prepare Azure DevOps Connection"

Write-SubStep "Organization: $($config.AzureDevOpsOrgUrl)"
Write-SubStep "Project: $($config.ProjectName)"
Write-Host ""

try {
    Write-SubStep "Encoding PAT for authentication..."
    $base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$($config.AzureDevOpsPAT)"))
    
    $script:AzureHeaders = @{
        Authorization = "Basic $base64AuthInfo"
        "Content-Type" = "application/json-patch+json"
        "Accept" = "application/json"
    }
    
    Write-Host "`n✓ Authentication headers prepared" -ForegroundColor Green
    
    Write-SubStep "Testing connection to Azure DevOps..."
    $testUri = "$($config.AzureDevOpsOrgUrl)/_apis/projects/$($config.ProjectName)?api-version=7.1"
    
    $response = Invoke-RestMethod -Uri $testUri -Method Get -Headers $script:AzureHeaders
    
    Write-Host "`n✓ Successfully connected to Azure DevOps!" -ForegroundColor Green
    Write-Host "  Project Name: $($response.name)" -ForegroundColor Gray
    Write-Host "  Project ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  Project State: $($response.state)" -ForegroundColor Gray
    Write-Host "  Project Visibility: $($response.visibility)" -ForegroundColor Gray
}
catch {
    Write-Host "`n✗ Failed to connect to Azure DevOps" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify PAT has 'Work Items (Read & Write)' scope" -ForegroundColor Gray
    Write-Host "  2. Check PAT hasn't expired" -ForegroundColor Gray
    Write-Host "  3. Verify organization URL is correct" -ForegroundColor Gray
    Write-Host "  4. Ensure project name matches exactly (case-sensitive)" -ForegroundColor Gray
    exit 1
}

Wait-ForUserToContinue

#--------------------------------------------------
# STEP 6: Parse and Validate Test Case IDs
#--------------------------------------------------
Write-StepHeader "6" "Parse and Validate Test Case IDs"

Write-SubStep "Input: $($config.TestIdsCommaSeparated)"

try {
    $script:TestIds = $config.TestIdsCommaSeparated -split ',' | ForEach-Object { [int]$_.Trim() }
    
    Write-Host "`n✓ Parsed $($script:TestIds.Count) test case ID(s)" -ForegroundColor Green
    Write-Host "  Test IDs: $($script:TestIds -join ', ')" -ForegroundColor Gray
    
    Write-Host "`n🔍 Validating test case access..." -ForegroundColor Cyan
    
    $accessible = @()
    $notFound = @()
    
    foreach ($testId in $script:TestIds) {
        Write-SubStep "Checking Test Case $testId..."
        
        try {
            $uri = "$($config.AzureDevOpsOrgUrl)/$($config.ProjectName)/_apis/wit/workitems/$testId`?api-version=7.1"
            $testCase = Invoke-RestMethod -Uri $uri -Method Get -Headers $script:AzureHeaders
            
            Write-Host "    ✓ Accessible - Title: $($testCase.fields.'System.Title')" -ForegroundColor Green
            Write-Host "      Type: $($testCase.fields.'System.WorkItemType') | State: $($testCase.fields.'System.State')" -ForegroundColor Gray
            $accessible += $testId
        }
        catch {
            Write-Host "    ✗ Not accessible or not found" -ForegroundColor Red
            $notFound += $testId
        }
    }
    
    Write-Host "`n📊 Validation Summary:" -ForegroundColor Cyan
    Write-Host "  Accessible: $($accessible.Count)" -ForegroundColor Green
    Write-Host "  Not Found: $($notFound.Count)" -ForegroundColor $(if ($notFound.Count -gt 0) { "Red" } else { "Green" })
    
    if ($notFound.Count -gt 0) {
        Write-Host "`n⚠️  Warning: $($notFound.Count) test case(s) not accessible" -ForegroundColor Yellow
        Write-Host "  IDs: $($notFound -join ', ')" -ForegroundColor Yellow
        
        $continue = Read-Host "`nContinue with accessible test cases only? (Y/n)"
        if ($continue -eq 'n' -or $continue -eq 'N') {
            exit 0
        }
        
        $script:TestIds = $accessible
    }
}
catch {
    Write-Host "`n✗ Error parsing test IDs: $_" -ForegroundColor Red
    exit 1
}

Wait-ForUserToContinue

#--------------------------------------------------
# STEP 7: Preview Planned Updates
#--------------------------------------------------
Write-StepHeader "7" "Preview Planned Updates"

Write-Host "This shows what WILL be updated in the next step.`n" -ForegroundColor Yellow

Write-Host "Data Mapping Strategy: Round-Robin" -ForegroundColor Cyan
Write-Host "  - If more test cases than data records, data will cycle`n" -ForegroundColor Gray

Write-Host "Planned Updates:" -ForegroundColor Cyan
Write-Host ("-" * 70)

for ($i = 0; $i -lt $script:TestIds.Count; $i++) {
    $testId = $script:TestIds[$i]
    $studentIndex = $i % $script:StudentData.Count
    $student = $script:StudentData[$studentIndex]
    
    Write-Host "Test Case $testId will be updated with:" -ForegroundColor Yellow
    Write-Host "  ID: $($student.ID)" -ForegroundColor Gray
    Write-Host "  Name: $($student.Name)" -ForegroundColor Gray
    
    if ($i -lt $script:TestIds.Count - 1) {
        Write-Host ""
    }
}

Write-Host ("-" * 70)
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Total Updates: $($script:TestIds.Count)" -ForegroundColor Gray
Write-Host "  Data Records Available: $($script:StudentData.Count)" -ForegroundColor Gray
Write-Host "  Target Field: Microsoft.VSTS.TCM.Parameters" -ForegroundColor Gray

Wait-ForUserToContinue "⚠️  Press Enter to proceed with ACTUAL UPDATES..."

#--------------------------------------------------
# STEP 8: Update Test Cases (THE REAL THING!)
#--------------------------------------------------
Write-StepHeader "8" "Update Test Cases"

Write-Host "⚠️  THIS STEP WILL MAKE ACTUAL CHANGES TO AZURE DEVOPS!" -ForegroundColor Yellow
Write-Host ""

$finalConfirm = Read-Host "Type 'YES' (in capitals) to confirm and proceed"

if ($finalConfirm -ne 'YES') {
    Write-Host "`n❌ Update cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 Starting updates...`n" -ForegroundColor Cyan

for ($i = 0; $i -lt $script:TestIds.Count; $i++) {
    $testId = $script:TestIds[$i]
    $studentIndex = $i % $script:StudentData.Count
    $student = $script:StudentData[$studentIndex]
    
    Write-Host "[$($i + 1)/$($script:TestIds.Count)] Updating Test Case $testId..." -ForegroundColor Cyan
    Write-Host "  Data: ID=$($student.ID), Name=$($student.Name)" -ForegroundColor Gray
    
    try {
        # Build parameters XML
        $studentIdEscaped = [System.Security.SecurityElement]::Escape($student.ID.ToString())
        $studentNameEscaped = [System.Security.SecurityElement]::Escape($student.Name.ToString())
        
        $parametersXml = @"
<parameters>
    <param name="ID">
        <value>$studentIdEscaped</value>
    </param>
    <param name="Name">
        <value>$studentNameEscaped</value>
    </param>
</parameters>
"@
        
        # Build update payload
        $updatePayload = @(
            @{
                op = "add"
                path = "/fields/Microsoft.VSTS.TCM.Parameters"
                value = $parametersXml
            }
        )
        
        # Send update request
        $uri = "$($config.AzureDevOpsOrgUrl)/$($config.ProjectName)/_apis/wit/workitems/$testId`?api-version=7.1"
        $body = $updatePayload | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri $uri -Method Patch -Headers $script:AzureHeaders -Body $body
        
        Write-Host "  ✓ Successfully updated!" -ForegroundColor Green
        $script:SuccessCount++
        
        # Small delay to avoid rate limiting
        Start-Sleep -Milliseconds 500
    }
    catch {
        Write-Host "  ✗ Failed to update: $_" -ForegroundColor Red
        $script:FailureCount++
    }
    
    Write-Host ""
}

Wait-ForUserToContinue

#--------------------------------------------------
# STEP 9: Summary and Results
#--------------------------------------------------
Write-StepHeader "9" "Summary and Results"

Write-Host "Update Process Complete!`n" -ForegroundColor Cyan

Write-Host "📊 Final Statistics:" -ForegroundColor Cyan
Write-Host ("-" * 50)
Write-Host "  Total Test Cases Processed: $($script:TestIds.Count)" -ForegroundColor Gray
Write-Host "  Successful Updates: $script:SuccessCount" -ForegroundColor $(if ($script:SuccessCount -gt 0) { "Green" } else { "Gray" })
Write-Host "  Failed Updates: $script:FailureCount" -ForegroundColor $(if ($script:FailureCount -gt 0) { "Red" } else { "Green" })
Write-Host "  Success Rate: $(if ($script:TestIds.Count -gt 0) { [math]::Round(($script:SuccessCount / $script:TestIds.Count) * 100, 2) } else { 0 })%" -ForegroundColor Cyan
Write-Host ("-" * 50)

if ($script:SuccessCount -gt 0) {
    Write-Host "`n✓ Updated Test Case IDs: $($script:TestIds -join ', ')" -ForegroundColor Green
    Write-Host "`n🔍 Verification Steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to: $($config.AzureDevOpsOrgUrl)/$($config.ProjectName)" -ForegroundColor Gray
    Write-Host "  2. Open Test Plans" -ForegroundColor Gray
    Write-Host "  3. Open one of the test cases (e.g., $($script:TestIds[0]))" -ForegroundColor Gray
    Write-Host "  4. Check the Parameters tab" -ForegroundColor Gray
    Write-Host "  5. Verify ID and Name are populated" -ForegroundColor Gray
}

if ($script:FailureCount -gt 0) {
    Write-Host "`n⚠️  Some updates failed. Please review the error messages above." -ForegroundColor Yellow
}

Write-Host "`n✨ Step-by-step execution complete!" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Verify the updates in Azure DevOps UI" -ForegroundColor Gray
Write-Host "  2. If successful, integrate into your Azure Pipeline" -ForegroundColor Gray
Write-Host "  3. Use pipeline variables instead of hardcoded values" -ForegroundColor Gray

#endregion

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Script execution finished" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
