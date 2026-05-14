$paths = @(
  "$env:TEMP\*",
  "$env:LOCALAPPDATA\Microsoft\Windows\INetCache\*",
  "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db",
  "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\iconcache_*.db",
  "$env:LOCALAPPDATA\CrashDumps\*",
  "$env:LOCALAPPDATA\Microsoft\Windows\WER\ReportArchive\*",
  "$env:LOCALAPPDATA\Microsoft\Windows\WER\ReportQueue\*",
  "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Code Cache\*",
  "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Service Worker\*",
  "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Code Cache\*",
  "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Service Worker\*",
  "$env:APPDATA\Code\Cache\*",
  "$env:APPDATA\Code\CachedData\*",
  "$env:APPDATA\Code\Service Worker\*",
  "$env:LOCALAPPDATA\Slack\Cache\*",
  "$env:LOCALAPPDATA\Slack\GPUCache\*"
)
foreach ($p in $paths) {
  Remove-Item -Path $p -Recurse -Force -ErrorAction SilentlyContinue
}
Clear-RecycleBin -Force -ErrorAction SilentlyContinue
Write-Host "Cleanup complete."



$teamsPath = "$env:LOCALAPPDATA\Packages\MSTeams_8wekyb3d8bbwe\LocalCache\Microsoft\MSTeams"
Get-ChildItem -Path $teamsPath -Include 'Cache','Code Cache','GPUCache','Service Worker','blob_storage','tmp' -Recurse -Directory -ErrorAction SilentlyContinue | ForEach-Object { Remove-Item "$($_.FullName)\*" -Recurse -Force -ErrorAction SilentlyContinue }
Write-Host "Done. Relaunch Teams."

Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, @{N='Memory(MB)';E={[math]::Round($_.WorkingSet64/1MB,1)}}

Stop-Process -Name explorer -Force; Start-Process explorer

Get-CimInstance Win32_Process -Filter "Name='msedgewebview2.exe'" | Sort-Object WorkingSetSize -Desc | Select-Object @{N='Memory(MB)';E={[math]::Round($_.WorkingSetSize/1MB,1)}}, ProcessId, CommandLine | Format-List


const allParts = rawCellValue
    .split('|')
    .map(p => p
        .replace(/\u00A0/g, ' ')   // nbsp -> space
        .replace(/\s+/g, ' ')      // collapse runs of whitespace
        .trim()
    )
    .filter(p => p.length > 0);    // drop empties from trailing | or ||


  for (let i = 0; i < allParts.length; i++) {                        
                        var expectedText= allParts[i];                        
                        await getElementWithText(page,"You are not eligible.");                                                            
                        await getElementWithText(page,expectedText);
                    }


async function isTextInViewport(
  page: Page,
  searchText: string
): Promise<boolean> {
  // ...
}

vimport { Page } from 'puppeteer';

async function isTextInViewport(
  page: Page,
  searchText: string
): Promise<boolean> {
  return await page.evaluate((text) => {
    const elements = document.querySelectorAll('*');

    for (const el of elements) {
      const rect = el.getBoundingClientRect();

      // Is this element currently on screen?
      const inViewport =
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.width > 0 &&
        rect.height > 0;

      if (!inViewport) continue;

      // Does this element directly contain the text? (not via deep descendants)
      const ownText = Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent ?? '')
        .join('')
        .trim();

      if (ownText.includes(text)) return true;
    }

    return false;
  }, searchText);
}

// Usage
const visible = await isTextInViewport(page, 'Age is required');
expect(visible).toBe(true);

Test Recorder — Project Description
What It Is
Test Recorder is a lightweight Windows desktop application built on WPF .NET 8 that automates the creation of Puppeteer-based test scripts for our QA automation framework.

The Problem It Solves
Currently every automation test script is written by hand. A tester must open the browser, inspect each element, find its accessible name, and manually write each line of code — one element at a time. This process is slow, repetitive, and prone to human error.

How It Works
The tester enters an Azure DevOps Test Case ID and their PAT token. The app fetches the test case details from Azure, generates a ready-to-use TypeScript test scaffold, and opens Chrome in recording mode. The tester then simply interacts with the application under test — clicking buttons, typing into fields, selecting options — exactly as an end user would. Every interaction is automatically captured and converted into the correct component-based TypeScript code in real time. When recording stops, three production-ready files are waiting in the output folder.

What Gets Generated Automatically
test.ts — a describe/it test skeleton populated with the actual Azure test steps

page.ts — a page object class with all recorded actions inside a method

shared-steps.ts — a shared async function template ready for reuse

Benefits to the Team
Benefit	Detail
Benefit	Detail
Faster test creation	What takes 30-60 minutes of manual scripting takes minutes to record
Fewer human errors	Accessible names are captured directly from the browser — no manual lookup
Consistent code style	Every recorded script follows the same page object pattern automatically
Azure integration	Test steps and IDs come directly from Azure DevOps — no copy pasting
Smart waits	Page load delays are handled automatically — no hard-coded wait times
IT friendly	Pure Microsoft stack — WPF .NET 8, NuGet packages, MSI installer
Technology
Built entirely on the Microsoft stack — WPF .NET 8, C#, Microsoft Playwright NuGet package, and Azure DevOps REST API — making it straightforward to approve, deploy, and maintain within a corporate Windows environment.
