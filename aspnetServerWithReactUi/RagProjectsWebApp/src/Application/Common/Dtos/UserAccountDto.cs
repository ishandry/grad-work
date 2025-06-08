using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Dtos
{
    public class UserAccountDto
    {
        public int Id { get; set; }
        public int ProjectsLimit { get; set; }
        public string Email { get; set; } = string.Empty;
        public int CurrentProjectsCount { get; set; }
        private class Mapping : Profile
        {
            public Mapping()
            {
                CreateMap<User, UserAccountDto>()
                    .ForMember(dest => dest.CurrentProjectsCount, opt => opt.MapFrom(src => src.AuthoredProjects.Count))
                    .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.IdentityUserId));
            }
        }
    }
}
