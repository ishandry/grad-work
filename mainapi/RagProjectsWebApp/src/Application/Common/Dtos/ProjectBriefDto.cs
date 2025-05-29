using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class ProjectBriefDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int AuthorId { get; set; }
        public List<LectureBriefDto> Lectures { get; set; } = new List<LectureBriefDto>();
        public bool IsAuthor { get; set; }
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<Project, ProjectBriefDto>()
                    .ForMember(d => d.IsAuthor, opt => opt.Ignore());
            }
        }
    }
}
