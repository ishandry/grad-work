using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class VocabDto
    {
        public int Id { get; set; }
        public int LectureId { get; set; }
        public string Word { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<LectureVocab, VocabDto>();
            }
        }
    }
}
