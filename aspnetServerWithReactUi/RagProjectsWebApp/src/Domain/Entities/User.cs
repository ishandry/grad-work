namespace RagProjectsWebApp.Domain.Entities
{
    public class User : BaseAuditableEntity
    {
        public int ProjectsLimit { get; set; } = 3;
        public string IdentityUserId { get; set; } = string.Empty;
        public virtual IList<Project> AuthoredProjects { get; set; } = new List<Project>();
        public virtual IList<ProjectUser> MemberProjects { get; set; } = new List<ProjectUser>();
    }
}
