# Check NODE_OPTIONS
echo %NODE_OPTIONS%

# Check memory limit
node -e "console.log('Heap limit:', Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024), 'MB')"


set NODE_OPTIONS=--max-old-space-size=4096
npm test

describe('My tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    
    // Clear all cache types
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCache');
    await client.send('Network.clearBrowserCookies');
    await client.send('Storage.clearDataForOrigin', {
      origin: '*',
      storageTypes: 'all'
    });
  });

  afterEach(async () => {
    await page.close();
  });

  afterAll(async () => {
    await browser.close();
  });
});
