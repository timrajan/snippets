const frames = typeof (page as any).frames === "function" ? (page as Page).frames() : (page as unknown as Frame).childFrames();
