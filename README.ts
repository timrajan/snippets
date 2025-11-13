   [HttpGet("status/mywebhook")]   // For browser
    [HttpPost("status/mywebhook")]  // For webhook
    public IActionResult MyWebhook()
    {
        return Ok(new { status = "Webhook endpoint is active" });
    }
