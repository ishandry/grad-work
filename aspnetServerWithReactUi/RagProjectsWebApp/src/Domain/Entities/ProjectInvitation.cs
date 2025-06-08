namespace RagProjectsWebApp.Domain.Entities
{
    public class ProjectInvitation : BaseAuditableEntity
    {
        public int ProjectId { get; set; }
        public string GeneratedCode { get; set; } = string.Empty;
        public virtual Project Project { get; set; } = null!;
    }
}
