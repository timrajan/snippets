const iframeHandle = await page.$('iframe');
if (iframeHandle) {
  const frame = await iframeHandle.contentFrame();
  if (frame) page = frame;   // <-- reassigning page to the frame
}
