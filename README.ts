public (bool Success, string Message) TriggerBuildPipeline(StudyRecord record)
{
    try
    {
        using (var httpClient = new HttpClient())
        {
            // CORRECT URL for Build Pipelines (Classic Build Definitions)
            var url = $"https://dev.azure.com/{_organization}/{_project}/_apis/build/builds?api-version=7.0";

            // Add Basic Authentication with PAT
            var authToken = Convert.ToBase64String(
                System.Text.Encoding.ASCII.GetBytes($":{_pat}"));
            httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authToken);

            // Build the payload for classic build pipeline
            var payload = new
            {
                definition = new
                {
                    id = _pipelineId
                },
                sourceBranch = _branch,
                parameters = JsonSerializer.Serialize(new
                {
                    // Map form fields to pipeline parameters
                    team = record.Team ?? "",
                    firstName = record.FirstName ?? "",
                    middleName = record.MiddleName ?? "",
                    lastName = record.LastName ?? "",
                    dateOfBirth = record.DateOfBirth ?? "",
                    emailAddress = record.EmailAddress ?? "",
                    studentIdentityID = record.StudentIdentityID ?? "",
                    studentInitialID = record.StudentInitialID ?? "",
                    environment = record.Environment ?? "",
                    studentIQLevel = record.StudentIQLevel ?? "",
                    studentRollNumber = record.StudentRollNumber ?? "",
                    studentRollName = record.StudentRollName ?? "",
                    studentParentEmailAddress = record.StudentParentEmailAddress ?? "",
                    status = record.Status ?? "",
                    type = record.Type ?? "",
                    tags = record.Tags ?? ""
                })
            };

            // Serialize to JSON
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            // Send POST request to Azure DevOps
            var response = httpClient.PostAsync(url, content).Result;

            if (response.IsSuccessStatusCode)
            {
                var responseBody = response.Content.ReadAsStringAsync().Result;
                return (true, $"Build pipeline triggered successfully! Response: {responseBody}");
            }
            else
            {
                var error = response.Content.ReadAsStringAsync().Result;
                return (false, $"Failed to trigger pipeline. Status: {response.StatusCode}. Error: {error}");
            }
        }
    }
    catch (Exception ex)
    {
        return (false, $"Error triggering Azure DevOps pipeline: {ex.Message}");
    }
}
