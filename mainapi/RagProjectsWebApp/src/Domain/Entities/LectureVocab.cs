namespace RagProjectsWebApp.Domain.Entities
{
    public class LectureVocab : BaseAuditableEntity
    {
        public int LectureId { get; set; }
        public virtual Lecture Lecture { get; set; } = null!;
        public string Word { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
    }
}
