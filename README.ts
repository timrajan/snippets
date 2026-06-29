[HttpPost]
public IActionResult ReceiveWebhook([FromBody] JsonElement payload)
{
    var json = payload.GetRawText();

    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "webhook_payloads.txt");

    System.IO.File.AppendAllText(
        filePath,
        $"{DateTime.UtcNow:O}\t{json}{Environment.NewLine}");

    return Ok();
}
