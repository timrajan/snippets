const clearAllPagesCache = async (browser) => {
  const pages = await browser.pages();
  const origins = [...new Set(pages.map(page => new URL(page.url()).origin))];
  
  // Get any page's CDP client (browser-level operations)
  const client = await pages[0].target().createCDPSession();
  
  // Clear browser-wide cache
  await client.send('Network.clearBrowserCache');
  await client.send('Network.clearBrowserCookies');
  
  // Clear storage for each unique origin
  for (const origin of origins) {
    await client.send('Storage.clearDataForOrigin', {
      origin: origin,
      storageTypes: 'all'
    });
  }
  
  // Clear Cache Storage API for each page
  for (const page of pages) {
    await page.evaluate(() => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    });
  }
};

// Usage
await clearAllPagesCache(browser);
