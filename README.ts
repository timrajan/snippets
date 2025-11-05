curl -u :{YourPAT} \
  -H "Content-Type: application/json" \
  -X POST \
  "https://dev.azure.com/{organization}/{project}/_apis/wit/wiql?api-version=7.0" \
  -d '{"query": "SELECT [System.Id] FROM WorkItems"}'
