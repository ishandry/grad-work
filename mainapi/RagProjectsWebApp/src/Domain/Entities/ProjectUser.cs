namespace RagProjectsWebApp.Domain.Entities
{
    public class ProjectUser : BaseAuditableEntity
    {
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTimeOffset? AcceptedAt { get; set; }
        public virtual Project Project { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}
