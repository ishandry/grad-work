namespace RagProjectsWebApp.Domain.Entities
{
    public class Source : BaseAuditableEntity
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? MimeType { get; set; }
        public DateTimeOffset? UploadedAt { get; set; }
        public bool? IsProcessing { get; set; }
        public virtual Project Project { get; set; } = null!;
    }
}
