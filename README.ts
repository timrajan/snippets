async function gotoWithRetry(page, url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await page.goto(url, options);

    const currentUrl = page.url();

    if (currentUrl === url) {
      return; // URL matches, we're good
    }

    console.warn(`Attempt ${attempt}: Expected ${url} but got ${currentUrl}, retrying...`);

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }

  throw new Error(`Failed to navigate to ${url} after ${maxRetries} attempts. Ended up at ${page.url()}`);
}
