// Webhook endpoint for Azure DevOps to notify build completion
        [HttpPost]
        [Route("StudyRecord/BuildWebhook")]
        public IActionResult BuildWebhook([FromBody] dynamic payload)
        {
            try
            {
                // Log the incoming webhook
                Console.WriteLine($"Webhook received: {payload}");

                // Extract build information from Azure DevOps webhook payload
                // The exact structure depends on your Azure DevOps webhook configuration
                // Common structure: payload.resource.status and payload.resource.result

                string buildStatus = payload?.resource?.status?.ToString();
                string buildResult = payload?.resource?.result?.ToString();

                // Get custom data passed in the build (e.g., study record ID)
                // You'll need to pass the record ID when triggering the build
                string recordIdStr = payload?.resource?.templateParameters?.recordId?.ToString();

                if (string.IsNullOrEmpty(recordIdStr))
                {
                    return BadRequest("Record ID not found in webhook payload");
                }

                if (!int.TryParse(recordIdStr, out int recordId))
                {
                    return BadRequest("Invalid record ID");
                }

                // Find the study record
                var record = _context.StudyRecords.FirstOrDefault(r => r.Id == recordId);
                if (record == null)
                {
                    return NotFound($"Study record with ID {recordId} not found");
                }

                // Update status based on build result
                if (buildStatus == "completed")
                {
                    if (buildResult == "succeeded")
                    {
                        record.Status = "Success";
                    }
                    else if (buildResult == "failed" || buildResult == "canceled")
                    {
                        record.Status = "Fail";
                    }

                    _context.SaveChanges();
                    Console.WriteLine($"Updated record {recordId} status to: {record.Status}");
                }

                return Ok(new { message = "Webhook processed successfully", recordId = recordId, status = record.Status });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing webhook: {ex.Message}");
                return StatusCode(500, $"Error processing webhook: {ex.Message}");
            }
        }
