// Method 3: Comprehensive storage clearing function
async function clearAllBrowserStorage(url) {
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();
    
    try {
        // Extract origin from URL
        const urlObj = new URL(url);
        const origin = `${urlObj.protocol}//${urlObj.host}`;
        
        console.log(`Clearing storage for origin: ${origin}`);
        
        // Navigate to the page first
        await page.goto(url);
        
        // Method 1: Clear via JavaScript
        await page.evaluate(() => {
            // Clear localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.clear();
            }
            
            // Clear sessionStorage
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.clear();
            }
            
            // Clear cookies via JavaScript (limited)
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
        });
        
        // Method 2: Clear via CDP commands
        await client.send('Network.clearBrowserCache');
        await client.send('Network.clearBrowserCookies');
        
        // Clear all storage types
        await client.send('Storage.clearDataForOrigin', {
            origin: origin,
            storageTypes: 'local_storage,session_storage,indexeddb,websql,cache_storage,service_workers,cookies'
        });
        
        // Clear DOM Storage specifically
        try {
            await client.send('DOMStorage.clear', {
                storageId: {
                    securityOrigin: origin,
                    isLocalStorage: true
                }
            });
        } catch (e) {
            console.log('LocalStorage clear via CDP failed (might not exist):', e.message);
        }
        
        try {
            await client.send('DOMStorage.clear', {
                storageId: {
                    securityOrigin: origin,
                    isLocalStorage: false
                }
            });
        } catch (e) {
            console.log('SessionStorage clear via CDP failed (might not exist):', e.message);
        }
        
        // Verify storage is cleared
        const verification = await page.evaluate(() => {
            return {
                localStorage: typeof localStorage !== 'undefined' ? localStorage.length : 'N/A',
                sessionStorage: typeof sessionStorage !== 'undefined' ? sessionStorage.length : 'N/A',
                cookies: document.cookie.length
            };
        });
        
        console.log('Storage verification after clearing:', verification);
        
        // Refresh page to ensure changes take effect
        await page.reload({ waitUntil: 'networkidle0' });
        
        console.log('Storage cleared successfully!');
        
    } catch (error) {
        console.error('Error clearing storage:', error);
    } finally {
        await browser.close();
    }
}
