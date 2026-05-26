page.on('request', req => console.log('→', req.method(), req.url()));
page.on('response', res => console.log('←', res.status(), res.url()));
page.on('requestfailed', req => console.log('✗', req.url(), req.failure()?.errorText));
