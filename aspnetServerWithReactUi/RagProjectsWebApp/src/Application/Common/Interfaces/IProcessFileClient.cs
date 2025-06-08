public interface IProcessFileClient
{
    Task CallProcessFileAsync(
        int sourceId,
        string s3Path,
        string projectId,
        string projectName,
        string callbackUrl);
}
