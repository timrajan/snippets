async function gotoWithRetry(page, url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await page.goto(url, { waitUntil: 'networkidle2', ...options });

    // Wait for the page to fully settle (no more redirects)
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    // catch silently in case there's no further navigation

    const currentUrl = page.url();

    if (currentUrl === url) {
      return;
    }

    console.warn(`Attempt ${attempt}: Expected ${url} but got ${currentUrl}, retrying...`);

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }

  throw new Error(`Failed to navigate to ${url} after ${maxRetries} attempts. Ended up at ${page.url()}`);
}
