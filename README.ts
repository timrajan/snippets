const puppeteer = require('puppeteer');

async function captureRedirectAndNavigate(page, linkSelector) {
  let redirectUrl = null;
  
  // Enable request interception
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = request.url();
    console.log('Intercepted request:', url);
    request.continue();
  });

  page.on('response', async (response) => {
    const status = response.status();
    const url = response.url();
    
    console.log(`Response: ${status} for ${url}`);
    
    // Capture redirects before Chrome error handling
    if (status >= 300 && status < 400) {
      const location = response.headers()['location'];
      if (location && !location.includes('chrome-error')) {
        redirectUrl = location;
        console.log('Real redirect URL found:', location);
      }
    }
  });

  // Click the link
  await page.click(linkSelector);
  
  // Wait for redirect to be captured
  await page.waitForTimeout(3000);

  if (redirectUrl) {
    console.log('Navigating to captured URL:', redirectUrl);
    
    // Handle both absolute and relative URLs
    let finalUrl = redirectUrl;
    if (redirectUrl.startsWith('/')) {
      const currentOrigin = new URL(page.url()).origin;
      finalUrl = currentOrigin + redirectUrl;
    }
    
    await page.goto(finalUrl, { waitUntil: 'networkidle0' });
    return finalUrl;
  }
  
  return null;
}

// Usage example
async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://a.com');
  
  const finalUrl = await captureRedirectAndNavigate(page, 'your-link-selector');
  
  if (finalUrl) {
    console.log('Successfully navigated to:', finalUrl);
  } else {
    console.log('No redirect URL captured');
  }
  
  console.log('Current URL:', page.url());
  await browser.close();
}

main().catch(console.error);
