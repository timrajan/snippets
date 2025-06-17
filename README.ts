import puppeteer, { Browser, Page } from 'puppeteer';

async function launchChrome(): Promise<void> {
  let browser: Browser | null = null;
  
  try {
    // Launch Chrome browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      defaultViewport: null, // Use default viewport
      args: [
        '--start-maximized', // Start maximized
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    console.log('Chrome browser launched successfully!');

    // Create a new page
    const page: Page = await browser.newPage();
    
    // Navigate to a website
    await page.goto('https://www.google.com', { 
      waitUntil: 'networkidle2' 
    });

    console.log('Navigated to Google');

    // Example: Take a screenshot
    await page.screenshot({ 
      path: 'google-homepage.png',
      fullPage: true 
    });

    console.log('Screenshot saved as google-homepage.png');

    // Wait for 3 seconds to see the browser in action
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('Error launching Chrome:', error);
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// Alternative function with more configuration options
async function launchChromeWithOptions(): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true, // Open DevTools
    slowMo: 100, // Slow down operations by 100ms
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--start-maximized',
      '--disable-extensions',
      '--disable-plugins',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  // Navigate and interact
  await page.goto('https://example.com');
  
  // Close after 5 seconds
  setTimeout(async () => {
    await browser.close();
  }, 5000);
}

// Run the function
launchChrome().catch(console.error);

// Uncomment to run the alternative version
// launchChromeWithOptions().catch(console.error);
