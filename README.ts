if (response.StatusCode == HttpStatusCode.NonAuthoritativeInformation)
{
    throw new HttpRequestException(
        "Azure DevOps returned 203 — the PAT is invalid, expired, or missing the required scope.");
}
