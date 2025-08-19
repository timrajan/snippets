// jest-setup.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import path from 'path';
import fs from 'fs';

// Global variables to store browser, page, and recorder instances
let browser: Browser;
let page: Page;
let recorder: PuppeteerScreenRecorder;

beforeEach(async () => {
  // Create recordings directory if it doesn't exist
  const recordingsDir = path.join(__dirname, 'test-recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  // Launch browser with specific flags for better recording
  browser = await puppeteer.launch({
    headless: false, // Must be false for video recording
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  });

  page = await browser.newPage();
  
  // Set viewport for consistent recording size
  await page.setViewport({ width: 1920, height: 1080 });

  // Initialize the screen recorder
  recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: true,
    fps: 25,
    videoFrame: {
      width: 1920,
      height: 1080,
    },
    videoCrf: 18, // Lower value = better quality (range: 0-51)
    videoCodec: 'libx264',
    videoPreset: 'ultrafast',
    videoBitrate: 1000,
    autopad: {
      color: 'black',
    },
    aspectRatio: '16:9',
  });

  // Generate unique filename for this test
  const testName = expect.getState().currentTestName || 'unknown-test';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${testName}-${timestamp}.mp4`;
  const filepath = path.join(recordingsDir, filename);

  // Start recording
  await recorder.start(filepath);
  
  console.log(`📹 Started recording: ${filename}`);
}, 30000); // Increased timeout for browser launch and recording setup

afterEach(async () => {
  try {
    // Stop recording
    if (recorder) {
      await recorder.stop();
      console.log('📹 Recording stopped and saved');
    }
  } catch (error) {
    console.error('Error stopping recording:', error);
  }

  try {
    // Close browser
    if (browser) {
      await browser.close();
    }
  } catch (error) {
    console.error('Error closing browser:', error);
  }
}, 30000); // Increased timeout for cleanup

// Export globals for use in tests
export { browser, page };
