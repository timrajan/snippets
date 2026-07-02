const frames = (typeof (page as any).frames === 'function')
  ? (page as Page).frames()           // Page: all frames
  : (page as Frame).childFrames();     // Frame: direct children only

for (const frame of frames) {
  if (typeof (page as any).mainFrame === 'function' && frame === (page as Page).mainFrame()) continue;
  // ...loop body...
}
