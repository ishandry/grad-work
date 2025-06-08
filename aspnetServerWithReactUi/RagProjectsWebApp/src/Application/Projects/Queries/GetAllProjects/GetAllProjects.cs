using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Common.Interfaces;

namespace RagProjectsWebApp.Application.Projects.Queries.GetAllProjects;

public record GetAllProjectsQuery : IRequest<List<ProjectBriefDto>>
{
}

public class GetAllProjectsQueryHandler : IRequestHandler<GetAllProjectsQuery, List<ProjectBriefDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;

    public GetAllProjectsQueryHandler(IApplicationDbContext context, IUserService userService, IMapper mapper)
    {
        _userService = userService;
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ProjectBriefDto>> Handle(GetAllProjectsQuery request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var list = await _context.Projects
            .Where(x => x.AuthorId == user.Id || x.Members.Select(m => m.UserId).Contains(user.Id))
            .ProjectTo<ProjectBriefDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        foreach (var project in list)
        {
            project.IsAuthor = project.AuthorId == user.Id;
            foreach (var lecture in project.Lectures)
            {
                lecture.IsAuthor = project.IsAuthor;
            }
        }

        return list;
    }
}
