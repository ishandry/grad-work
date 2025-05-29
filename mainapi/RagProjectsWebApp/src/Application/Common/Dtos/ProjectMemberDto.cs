using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class ProjectMemberDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public DateTimeOffset? AcceptedAt { get; set; }
        public string Email { get; set; } = string.Empty;
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<ProjectUser, ProjectMemberDto>()
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.IdentityUserId));
            }
        }
    }
}
