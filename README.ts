##############################################################################
# UpdateAzureTestsFromDB.ps1
# 
# Purpose: Query PostgreSQL database and update Azure DevOps Test Case data tables
# Usage: Called as a PowerShell task in Azure Release Pipeline
##############################################################################

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresConnectionString,
    
    [Parameter(Mandatory=$true)]
    [string]$AzureDevOpsOrgUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$AzureDevOpsPAT,
    
    [Parameter(Mandatory=$true)]
    [string]$ProjectName,
    
    [Parameter(Mandatory=$true)]
    [string]$TestIdsCommaSeparated,
    
    [Parameter(Mandatory=$false)]
    [string]$SqlQuery = "SELECT ID, Name FROM Student"
)

#region Module Imports
# Import required modules
if (-not (Get-Module -ListAvailable -Name Npgsql)) {
    Write-Host "Installing Npgsql module..."
    Install-Module -Name Npgsql -Force -Scope CurrentUser -AllowClobber
}
#endregion

#region PostgreSQL Functions
function Connect-PostgreSQL {
    param(
        [string]$ConnectionString
    )
    
    try {
        Write-Host "Connecting to PostgreSQL database..."
        $connection = New-Object Npgsql.NpgsqlConnection($ConnectionString)
        $connection.Open()
        Write-Host "✓ Successfully connected to PostgreSQL" -ForegroundColor Green
        return $connection
    }
    catch {
        Write-Error "Failed to connect to PostgreSQL: $_"
        throw
    }
}

function Get-StudentDataFromDB {
    param(
        [Npgsql.NpgsqlConnection]$Connection,
        [string]$Query
    )
    
    try {
        Write-Host "Executing query: $Query"
        $command = $Connection.CreateCommand()
        $command.CommandText = $Query
        
        $adapter = New-Object Npgsql.NpgsqlDataAdapter($command)
        $dataSet = New-Object System.Data.DataSet
        [void]$adapter.Fill($dataSet)
        
        $results = @()
        foreach ($row in $dataSet.Tables[0].Rows) {
            $results += [PSCustomObject]@{
                ID = $row["ID"]
                Name = $row["Name"]
            }
        }
        
        Write-Host "✓ Retrieved $($results.Count) records from database" -ForegroundColor Green
        return $results
    }
    catch {
        Write-Error "Failed to execute query: $_"
        throw
    }
}

function Close-PostgreSQLConnection {
    param(
        [Npgsql.NpgsqlConnection]$Connection
    )
    
    if ($Connection -and $Connection.State -eq 'Open') {
        $Connection.Close()
        $Connection.Dispose()
        Write-Host "✓ PostgreSQL connection closed" -ForegroundColor Green
    }
}
#endregion

#region Azure DevOps Functions
function Get-AzureDevOpsHeaders {
    param(
        [string]$PAT
    )
    
    $base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$PAT"))
    return @{
        Authorization = "Basic $base64AuthInfo"
        "Content-Type" = "application/json-patch+json"
    }
}

function Get-TestCase {
    param(
        [string]$OrgUrl,
        [string]$ProjectName,
        [int]$TestId,
        [hashtable]$Headers
    )
    
    try {
        $uri = "$OrgUrl/$ProjectName/_apis/wit/workitems/$TestId`?api-version=7.1"
        $response = Invoke-RestMethod -Uri $uri -Method Get -Headers $Headers
        return $response
    }
    catch {
        Write-Warning "Failed to retrieve test case $TestId : $_"
        return $null
    }
}

function Update-TestCaseDataTable {
    param(
        [string]$OrgUrl,
        [string]$ProjectName,
        [int]$TestId,
        [hashtable]$Headers,
        [PSCustomObject]$StudentData
    )
    
    try {
        Write-Host "Updating Test Case $TestId with ID: $($StudentData.ID), Name: $($StudentData.Name)"
        
        # Get current test case to check existing data
        $testCase = Get-TestCase -OrgUrl $OrgUrl -ProjectName $ProjectName -TestId $TestId -Headers $Headers
        
        if (-not $testCase) {
            Write-Warning "Test case $TestId not found or inaccessible"
            return $false
        }
        
        # Build the update payload
        # Azure DevOps Test Cases use "Microsoft.VSTS.TCM.Parameters" field for data table
        $parametersXml = Build-ParametersXml -StudentData $StudentData
        
        $updatePayload = @(
            @{
                op = "add"
                path = "/fields/Microsoft.VSTS.TCM.Parameters"
                value = $parametersXml
            }
        )
        
        $uri = "$OrgUrl/$ProjectName/_apis/wit/workitems/$TestId`?api-version=7.1"
        $body = $updatePayload | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri $uri -Method Patch -Headers $Headers -Body $body
        
        Write-Host "✓ Successfully updated Test Case $TestId" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Failed to update test case $TestId : $_"
        return $false
    }
}

function Build-ParametersXml {
    param(
        [PSCustomObject]$StudentData
    )
    
    # Build XML for the parameters table
    # This creates a data table with ID and Name columns
    $xml = @"
<parameters>
    <param name="ID">
        <value>$($StudentData.ID)</value>
    </param>
    <param name="Name">
        <value>$([System.Security.SecurityElement]::Escape($StudentData.Name))</value>
    </param>
</parameters>
"@
    
    return $xml
}

function Update-TestCaseCustomFields {
    param(
        [string]$OrgUrl,
        [string]$ProjectName,
        [int]$TestId,
        [hashtable]$Headers,
        [PSCustomObject]$StudentData
    )
    
    # Alternative approach: Update custom fields directly
    # Use this if you have custom fields named "ID" and "Name" in your test cases
    
    try {
        Write-Host "Updating Test Case $TestId custom fields with ID: $($StudentData.ID), Name: $($StudentData.Name)"
        
        $updatePayload = @(
            @{
                op = "add"
                path = "/fields/Custom.ID"
                value = $StudentData.ID
            },
            @{
                op = "add"
                path = "/fields/Custom.Name"
                value = $StudentData.Name
            }
        )
        
        $uri = "$OrgUrl/$ProjectName/_apis/wit/workitems/$TestId`?api-version=7.1"
        $body = $updatePayload | ConvertTo-Json -Depth 10
        
        $response = Invoke-RestMethod -Uri $uri -Method Patch -Headers $Headers -Body $body
        
        Write-Host "✓ Successfully updated Test Case $TestId custom fields" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Failed to update test case custom fields $TestId : $_"
        return $false
    }
}
#endregion

#region Main Orchestration
function Update-AzureTestsFromDatabase {
    param(
        [string]$PostgresConnectionString,
        [string]$AzureDevOpsOrgUrl,
        [string]$AzureDevOpsPAT,
        [string]$ProjectName,
        [array]$TestIds,
        [string]$SqlQuery
    )
    
    $connection = $null
    $successCount = 0
    $failureCount = 0
    
    try {
        # Step 1: Connect to PostgreSQL and fetch data
        $connection = Connect-PostgreSQL -ConnectionString $PostgresConnectionString
        $studentData = Get-StudentDataFromDB -Connection $connection -Query $SqlQuery
        
        if ($studentData.Count -eq 0) {
            Write-Warning "No data retrieved from database. Exiting."
            return
        }
        
        # Step 2: Prepare Azure DevOps authentication
        $headers = Get-AzureDevOpsHeaders -PAT $AzureDevOpsPAT
        
        # Step 3: Loop through test IDs and update
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "Starting update of $($TestIds.Count) test cases" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        for ($i = 0; $i -lt $TestIds.Count; $i++) {
            $testId = $TestIds[$i]
            
            # Get corresponding student data (cycling through if more tests than students)
            $studentIndex = $i % $studentData.Count
            $student = $studentData[$studentIndex]
            
            Write-Host "`nProcessing Test Case $testId with Student data (Index: $studentIndex)..."
            
            # Update the test case
            $success = Update-TestCaseDataTable `
                -OrgUrl $AzureDevOpsOrgUrl `
                -ProjectName $ProjectName `
                -TestId $testId `
                -Headers $headers `
                -StudentData $student
            
            if ($success) {
                $successCount++
            } else {
                $failureCount++
            }
            
            # Add a small delay to avoid rate limiting
            Start-Sleep -Milliseconds 500
        }
        
        # Step 4: Summary
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "Update Summary" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Total Test Cases: $($TestIds.Count)"
        Write-Host "Successful Updates: $successCount" -ForegroundColor Green
        Write-Host "Failed Updates: $failureCount" -ForegroundColor $(if ($failureCount -gt 0) { "Red" } else { "Green" })
        Write-Host "========================================`n" -ForegroundColor Cyan
        
        if ($failureCount -gt 0) {
            Write-Warning "Some test cases failed to update. Please review the logs above."
            exit 1
        }
    }
    catch {
        Write-Error "Critical error in main orchestration: $_"
        throw
    }
    finally {
        # Clean up
        Close-PostgreSQLConnection -Connection $connection
    }
}
#endregion

#region Script Entry Point
try {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Azure DevOps Test Update from PostgreSQL" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # Parse test IDs
    $testIdsArray = $TestIdsCommaSeparated -split ',' | ForEach-Object { [int]$_.Trim() }
    
    Write-Host "Configuration:"
    Write-Host "  - Organization URL: $AzureDevOpsOrgUrl"
    Write-Host "  - Project: $ProjectName"
    Write-Host "  - Test IDs: $($testIdsArray -join ', ')"
    Write-Host "  - SQL Query: $SqlQuery`n"
    
    # Execute main function
    Update-AzureTestsFromDatabase `
        -PostgresConnectionString $PostgresConnectionString `
        -AzureDevOpsOrgUrl $AzureDevOpsOrgUrl `
        -AzureDevOpsPAT $AzureDevOpsPAT `
        -ProjectName $ProjectName `
        -TestIds $testIdsArray `
        -SqlQuery $SqlQuery
    
    Write-Host "`n✓ Script completed successfully" -ForegroundColor Green
}
catch {
    Write-Error "Script execution failed: $_"
    exit 1
}
#endregion
