const clearAllCache = async (page) => {
  // Get CDP session
  const client = await page.target().createCDPSession();
  
  // Clear various types of cache and storage
  await Promise.all([
    client.send('Network.clearBrowserCache'),
    client.send('Network.clearBrowserCookies'),
    client.send('Storage.clearDataForOrigin', {
      origin: await page.url(),
      storageTypes: 'all'
    }),
    page.evaluate(() => {
      // Clear web storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear service worker caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    })
  ]);
};

// Usage
await clearAllCache(page);
