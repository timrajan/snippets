// Monitor ongoing requests
page.on('request', request => {
  console.log('→ Request:', request.url());
});

page.on('response', response => {
  console.log('← Response:', response.url(), response.status());
});

page.on('requestfinished', request => {
  console.log('✓ Finished:', request.url());
});

page.on('requestfailed', request => {
  console.log('✗ Failed:', request.url());
});
