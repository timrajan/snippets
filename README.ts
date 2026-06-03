const browser = await puppeteer.launch({ headless: true });
const pid = browser.process()?.pid;
console.log('Browser PID:', pid, '| Node account:', require('os').userInfo().username);
