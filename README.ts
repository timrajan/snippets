getTestPlanApiInstance:Error: tunneling socket could not be established, statusCode=407

.\svc.cmd stop
.\config.cmd --proxyurl http://correct-proxy:port --proxyusername "DOMAIN\BBB" --proxypassword "your-password"
.\svc.cmd start
