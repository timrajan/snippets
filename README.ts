const dimensions = await page.evaluate(() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  });
  
  // Set viewport to match window size
  await page.setViewport({
    width: dimensions.width,
    height: dimensions.height,
    deviceScaleF
