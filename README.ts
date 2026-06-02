const browser = await puppeteer.launch({
  args: [
    '--host-resolver-rules=MAP *azureedge.net 127.0.0.1'
  ]
});
