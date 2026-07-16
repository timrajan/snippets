const frames = typeof (page as { frames?: unknown }).frames === "function"
  ? (page as Page).frames()
  : (page as unknown as Frame).childFrames();
