silly audit bulk request failed [object Object]
1575 http fetch GET 403 https://abc.com/artifactory/api/npm/npm-registry-remote/ansi-regex/-/ansi-regex-6.2.2.tgz 134ms (cache skip)
1576 http fetch POST 403 https://abc.com/artifactory/api/npm/npm-registry-remote/-/npm/v1/security/audits/quick 21ms (cache skip)
1577 verbose audit error HttpErrorGeneral: 403 Forbidden - POST https://abc.com/artifactory/api/npm/npm-registry-remote/-/npm/v1/security/audits/quick
1577 verbose audit error     at C:\Program Files\nodejs\node_modules\npm\node_modules\npm-registry-fetch\lib\check-response.js:103:15
1577 verbose audit error     at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
1577 verbose audit error     at async [getReport] (C:\Program Files\nodejs\node_modules\npm\node_modules\@npmcli\arborist\lib\audit-report.js:336:21)
1577 verbose audit error     at async AuditReport.run (C:\Program Files\nodejs\node_modules\npm\node_modules\@npmcli\arborist\lib\audit-report.js:106:19) {
1577 verbose audit error   headers: [Object: null prototype] {
1577 verbose audit error     date: [ 'Fri, 03 Oct 2025 02:27:12 GMT' ],
1577 verbose audit error     'content-type': [ 'application/json;charset=ISO-8859-1' ],
1577 verbose audit error     'content-length': [ '152' ],
1577 verbose audit error     connection: [ 'keep-alive' ],
1577 verbose audit error     'www-authenticate': [ 'Basic realm="Artifactory Realm"' ],
1577 verbose audit error     'x-fetch-attempts': [ '1' ],
1577 verbose audit error     'x-local-cache-status': [ 'skip' ]
1577 verbose audit error   },
1577 verbose audit error   statusCode: 403,
1577 verbose audit error   code: 'E403',
1577 verbose audit error   method: 'POST',
1577 verbose audit error   uri: 'https://abc.com/artifactory/api/npm/npm-registry-remote/-/npm/v1/security/audits/quick',
1577 verbose audit error   body: { errors: [ [Object] ] },
1577 verbose audit error   pkgid: 'quick'
