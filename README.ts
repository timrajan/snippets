// jest.setup.js
beforeEach(async () => {
  const { testPath } = expect.getState();
  
  // Run only for tests in specific files/folders
  if (testPath.includes('/authenticated/') || testPath.includes('.auth.test.js')) {
    // Your puppeteer setup code
  }
});
