[HttpPost]
public IActionResult ReceiveWebhook([FromBody] JsonElement payload)
{
   var json = payload.GetRawText();

    var folder = Path.Combine(_env.ContentRootPath, "WebhookLogs");
    Directory.CreateDirectory(folder);

    var filePath = Path.Combine(folder, "webhook_payloads.txt");
    System.IO.File.AppendAllText(filePath, $"{DateTime.UtcNow:O}\t{json}{Environment.NewLine}");

    return Ok();
}
