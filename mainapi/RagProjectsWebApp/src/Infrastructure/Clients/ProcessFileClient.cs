using System.Net.Http.Json;

public class ProcessFileClient : IProcessFileClient
{
    private readonly HttpClient _http;

    public ProcessFileClient(HttpClient http)
        => _http = http;

    public async Task CallProcessFileAsync(
        int sourceId,
        string s3Path,
        string projectId,
        string projectName,
        string callbackUrl)
    {
        var dto = new
        {
            source_id = sourceId,
            s3_path = s3Path,
            project_id = projectId,
            project_name = projectName,
            callback_url = callbackUrl
        };

        var resp = await _http.PostAsJsonAsync("process-file", dto);
        resp.EnsureSuccessStatusCode();
    }
}
