
let input = document.getElementById('txtName');
let styles = window.getComputedStyle(input);
console.log('color:', styles.color);
console.log('background:', styles.backgroundColor);
console.log('opacity:', styles.opacity);
console.log('visibility:', styles.visibility);


import https from 'https';

const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxy && proxy.trim() !== '') {
  const { HttpsProxyAgent } = require('https-proxy-agent');
  https.globalAgent = new HttpsProxyAgent(proxy);
}


import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxy) {
  https.globalAgent = new HttpsProxyAgent(proxy);
}

// Then your existing code below
import * as azdev from 'azure-devops-node-api';

const authHandler = azdev.getPersonalAccessTokenHandler(pat);
const connection = new azdev.WebApi(orgUrl, authHandler);






import * as azdev from 'azure-devops-node-api';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const agent = new HttpsProxyAgent(proxy);

const authHandler = azdev.getPersonalAccessTokenHandler(pat);
const connection = new azdev.WebApi(orgUrl, authHandler);

// Override the request options to use the proxy agent
connection.rest.client.requestOptions = {
  agent: agent
};



import * as azdev from 'azure-devops-node-api';

const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;

const proxyConfig = {
  proxy: {
    proxyUrl: proxy,
    proxyBypassHosts: ['localhost', '127.0.0.1']
  }
};

const authHandler = azdev.getPersonalAccessTokenHandler(pat);
const connection = new azdev.WebApi(orgUrl, authHandler, proxyConfig);


import { HttpsProxyAgent } from 'https-proxy-agent';

const agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);

const connection = new azdev.WebApi(orgUrl, authHandler, {
  socketTimeout: 30000,
  proxy: {
    proxyUrl: process.env.HTTPS_PROXY
  }
});
```

Also — is your proxy `http://` or `https://`? This matters. If the proxy itself is HTTP (which is common), make sure the URL starts with `http://` not `https://`:
```
http://proxy.company.com:8080    ← correct for most proxies
https://proxy.company.com:8080   ← usually wrong




const { HttpsProxyAgent } = require('https-proxy-agent');
const https = require('https');

const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
console.log('Using proxy:', proxy);

const agent = new HttpsProxyAgent(proxy);

https.get('https://dev.azure.com', { agent }, (res) => {
  console.log('Status:', res.statusCode);
}).on('error', (e) => {
  console.log('Error:', e.message);
});
