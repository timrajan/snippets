process.stdout.write('=== TEST FILE LOADED ===\n');
process.stdout.write('=== PAGE CREATED, ATTACHING LISTENERS ===\n');

page.on('request', req => process.stdout.write(`→ ${req.method()} ${req.url()}\n`));
page.on('response', res => process.stdout.write(`← ${res.status()} ${res.url()}\n`));
page.on('requestfailed', req => process.stdout.write(`✗ ${req.url()} ${req.failure()?.errorText}\n`));

process.stdout.write('=== LISTENERS ATTACHED ===\n');
