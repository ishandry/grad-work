namespace RagProjectsWebApp.Domain.Entities
{
    public class Lecture : BaseAuditableEntity
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? TextContent { get; set; } = string.Empty;
        public string? OriginalFilePath { get; set; }
        public int OrderIndex { get; set; }
        public virtual Project Project { get; set; } = null!;
        public virtual IList<LectureVocab> Vocab { get; set; } = new List<LectureVocab>();
    }
}
