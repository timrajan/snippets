Gather two things first: the proxy account's username/password from infra (they confirmed it never rotates, so they have it), and an ADO PAT with Agent Pools (read & manage) scope — created by you or whoever administers the agent pool.
Stop the agent service.
In the agent root, from an admin prompt: .\config.cmd remove (it'll ask for the PAT to deregister).
Reconfigure with proxy included:
.\config.cmd --url https://dev.azure.com/yourorg --auth pat --token <PAT> --pool <your-pool> --agent <agent-name> --runAsService --windowsLogonAccount <service-account> --proxyurl http://your-proxy:port --proxyusername "<proxy-user>" --proxypassword "<proxy-pass>"

(or run .\config.cmd bare and answer the prompts — same result). Reuse the same pool and agent name so your pipelines don't need touching. This re-stores the proxy credential fresh in the (now-healthy) profile.
5. Verify the agent shows Online in the ADO pool view,
