By default Puppeteer forces an 800×600 viewport via the CDP Emulation.setDeviceMetricsOverride command, regardless of how big the actual browser window is. Passing zeros is the protocol's signal to clear that override:

width: 0, height: 0 — remove the size override, so the page renders at whatever the real browser window's content area is.
