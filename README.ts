const browser = await puppeteer.launch({ headless: true });
const pid = browser.process()?.pid;
console.log('Browser PID:', pid, '| Node account:', require('os').userInfo().username);


- powershell: |
    whoami
    nslookup something.azureedge.net
    curl -v https://something.azureedge.net
  displayName: 'Prove service account cannot reach azureedge.net'
