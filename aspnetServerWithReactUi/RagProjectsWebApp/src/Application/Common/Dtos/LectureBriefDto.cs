using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Application.TodoLists.Queries.GetTodos;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class LectureBriefDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public bool IsAuthor { get; set; }
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<Lecture, LectureBriefDto>()
                    .ForMember(d => d.IsAuthor, opt => opt.Ignore());
            }
        }
    }
}
