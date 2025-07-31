https://1drv.ms/u/c/826b11a43e37bdb6/ERuC76vsstlJpwVm_M55ShMBlmfJx_Nw6IgpdMIQCdg2IA?e=bZVErA

await Promise.all([
  // Document is ready
  page.waitForFunction(() => document.readyState === 'complete'),
  
  // No loading spinners (ignore if they don't exist)
  page.waitForSelector('.loading, .spinner, .skeleton-loader', { hidden: true })
    .catch(() => {}),
  
  // Main content is present
  page.waitForSelector('body:not(:empty)', { visible: true }),
  

]);
