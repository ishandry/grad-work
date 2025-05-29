namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class SignedUrlDto
    {
        public string Url { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public int ProjectId { get; set; }
    }
}
