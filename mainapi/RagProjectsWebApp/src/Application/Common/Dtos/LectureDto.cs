using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class LectureDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? TextContent { get; set; } = string.Empty;
        public string? OriginalFilePath { get; set; }
        public int OrderIndex { get; set; }
        public List<VocabDto> Vocab { get; set; } = new List<VocabDto>();
        public bool IsAuthor { get; set; }
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<Lecture, LectureDto>()
                    .ForMember(d => d.IsAuthor, opt => opt.Ignore());
            }
        }
    }
}
