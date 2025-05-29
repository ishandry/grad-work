using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class ProjectSourceDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public string? MimeType { get; set; }
        public DateTimeOffset? UploadedAt { get; set; }
        public bool? IsProcessing { get; set; }
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<Source, ProjectSourceDto>();
            }
        }
    }
}
