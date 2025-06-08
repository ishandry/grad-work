using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int AuthorId { get; set; }
        public List<LectureBriefDto> Lectures { get; set; } = new List<LectureBriefDto>();
        public bool IsAuthor { get; set; }
        public List<ProjectMemberDto> Members { get; set; } = new List<ProjectMemberDto>();
        public string InviteCode { get; set; } = string.Empty;
        public List<ProjectSourceDto> Sources { get; set; } = new List<ProjectSourceDto>();
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<Project, ProjectDto>()
                    .ForMember(d => d.IsAuthor, opt => opt.Ignore())
                    .ForMember(d => d.InviteCode, opt => opt.MapFrom(s => s.Invitations.First().GeneratedCode));
            }
        }
    }
}
