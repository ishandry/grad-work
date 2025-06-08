namespace RagProjectsWebApp.Domain.Entities
{
    public class Project : BaseAuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int AuthorId { get; set; }
        public virtual User Author { get; set; } = null!;
        public virtual IList<ProjectUser> Members { get; set; } = new List<ProjectUser>();
        public virtual IList<ProjectInvitation> Invitations { get; set; } = new List<ProjectInvitation>();
        public virtual IList<Lecture> Lectures { get; set; } = new List<Lecture>();
        public virtual IList<Source> Sources { get; set; } = new List<Source>();
    }
}
