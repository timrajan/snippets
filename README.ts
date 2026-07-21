$env:PGPASSWORD = "your_pass"
$psql = "C:\Program Files\PostgreSQL\16\bin\psql.exe"
$log  = "C:\jobs\move_rows.log"
$csv  = "C:\jobs\transfer.csv"
$ids  = "C:\jobs\transfer_ids.txt"

"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - run started" | Add-Content $log

# 1. Capture IDs of Success rows that haven't been transferred yet
& $psql -h localhost -U your_user -d ABC -t -A -c "SELECT id FROM abc WHERE status = 'Success' AND transferred_at IS NULL" | Set-Content $ids

$idList = (Get-Content $ids | Where-Object { $_ -match '\d' }) -join ','

if ($idList) {
    # 2. Copy those rows out — exclude the marker column so it matches xyz's schema
    & $psql -h localhost -U your_user -d ABC -c "\copy (SELECT id, name, status FROM abc WHERE id IN ($idList)) TO '$csv' WITH CSV"

    # 3. Insert into xyz
    & $psql -h localhost -U your_user -d XYZ -c "\copy xyz FROM '$csv' WITH CSV"

    # 4. Mark as transferred only if insert succeeded (rows stay in abc)
    if ($LASTEXITCODE -eq 0) {
        & $psql -h localhost -U your_user -d ABC -c "UPDATE abc SET transferred_at = NOW() WHERE id IN ($idList)"
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - copied rows: $idList" | Add-Content $log
    } else {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - INSERT FAILED, will retry next run: $idList" | Add-Content $log
    }
} else {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - nothing to copy" | Add-Content $log
}

Remove-Item $csv, $ids -ErrorAction SilentlyContinue


Slide 1 — Title

Title: End-to-End Test Data Workflow
Subtitle: From SQL Query to Test Execution — Automated Test Data Provisioning
Footer: Team name / date

Slide 2 — The Problem / Why This Matters

Test cases cannot run without valid, case-specific test data
Test data lives on the mainframe — it isn't directly consumable by our test framework
Manual data preparation is slow, error-prone, and doesn't scale across a large regression suite
We need a repeatable pipeline that takes a test case from "needs data" to "ready to execute"

Slide 3 — Workflow at a Glance (this is your key visual — a horizontal flow diagram)

Test Case → SQL Query → Mainframe → Raw Test Data → Association System → Unique ID → ADO Data Table → Test Execution
One-line caption: "Every test case owns its query; every execution sources its data from ADO"

Slide 4 — Step 1: Test Case & SQL Query Mapping

Every test case has a dedicated SQL query — a 1:1 mapping
The query encodes the exact data conditions that test case needs (account type, status, product, etc.)
Queries are maintained alongside the test case, so data requirements are version-controlled and traceable

Slide 5 — Step 2: Mainframe Data Extraction

The SQL query is submitted to the mainframe, the system of record for all test data
Mainframe executes the query and returns matching raw test data
Key point: this output is raw — it is not yet usable by the test

Slide 6 — Step 3: Data Association & ID Generation

Raw test data is passed to the association system
This system enriches the data — performing the additional associations the test requires
Output: a single unique ID that represents the fully prepared, test-ready data set

Slide 7 — Step 4: Updating the ADO Data Table

The generated ID is written into the test case's data table in ADO
ADO becomes the single source of truth linking each test case to its ready-to-use data
No hard-coded data in test scripts — data is externalized and refreshable

Slide 8 — Step 5: Test Execution

At runtime, the test case reads its data (via the ID) from the ADO data table
Test executes against fresh, valid, case-specific data every run
Result: reliable, repeatable execution with zero manual data handling

Slide 9 — Benefits / Closing

Traceability: query → data → ID → test case, all linked end to end
Repeatability: data can be regenerated any time by re-running the pipeline
Scalability: same workflow serves one test or the entire regression suite
Quality: eliminates stale or mismatched test data as a failure cause

Optional Slide 10 — Next Steps (if you're pitching further automation)

Automate the full pipeline so data provisioning runs as a pre-execution step
Add validation/health checks on the returned ID before ADO update
Monitor data refresh frequency and failure rates

For slide 3, a simple left-to-right chevron or pipeline diagram with the eight stages works well — that single visual carries the whole story, and slides 4–8 just zoom into each stage. Want me to tighten this down to fewer slides, or write speaker notes for any of them?
