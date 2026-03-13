var url = $"https://dev.azure.com/{_org}/{_project}/_apis/pipelines/{_pipelineId}/runs?api-version=6.0-preview";


var payload = new
{
    templateParameters = new Dictionary<string, string>
    {
        { "param1", param1value },
        { "param2", param2value }
    },
    resources = new
    {
        repositories = new
        {
            self = new { refName = $"refs/heads/{_branch}" }
        }
    }
};
