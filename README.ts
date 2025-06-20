const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();

// Enable request interception
await page.setRequestInterception(true);

page.on('request', (request) => {
  const url = request.url();
  
  // If it's an HTTP URL, convert to HTTPS
  if (url.startsWith('http://')) {
    const httpsUrl = url.replace('http://', 'https://');
    console.log(`Redirecting ${url} to ${httpsUrl}`);
    request.continue({ url: httpsUrl });
  } else {
    request.continue();
  }
});

// Navigate to your initial HTTPS URL
await page.goto('https://a.com');

// Click the link that would redirect to http://b.com
await page.click('your-link-selector');

// The redirect will automatically be converted to HTTPS
await page.waitForNavigation({ waitUntil: 'networkidle0' });

console.log('Final URL:', page.url()); // Should be https://b.com

await browser.close();
