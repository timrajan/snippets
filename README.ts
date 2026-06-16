private readonly IConfiguration _configuration;

public BuildController(IConfiguration configuration)
{
    _configuration = configuration;
}

In PowerShell: [guid]::NewGuid().ToString("N")



X-Secret-Token: a7f3c9e2b8d4


{
  "Webhook": {
    "SecretToken": "a7f3c9e2b
  }
}



// ---- The authentication check, isolated so it's easy to read and reuse ----
        private bool IsValidSecret()
        {
            // The secret you invented, read from configuration (appsettings.json or env var).
            var expected = _configuration["Webhook:SecretToken"];
 
            // Fail closed: if no secret is configured, reject everyone rather than
            // accidentally leaving the endpoint wide open.
            if (string.IsNullOrEmpty(expected))
            {
                return false;
            }
 
            // The value Azure DevOps sends in the custom header.
            var provided = Request.Headers["X-Secret-Token"].ToString();
            if (string.IsNullOrEmpty(provided))
            {
                return false;
            }
 
            // Straightforward exact comparison of the two strings.
            return string.Equals(provided, expected, StringComparison.Ordinal);
        }

