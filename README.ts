await Promise.all([
  // Document is ready
  page.waitForFunction(() => document.readyState === 'complete'),
  
  // No loading spinners (ignore if they don't exist)
  page.waitForSelector('.loading, .spinner, .skeleton-loader', { hidden: true })
    .catch(() => {}),
  
  // Main content is present
  page.waitForSelector('body:not(:empty)', { visible: true }),
  

]);
