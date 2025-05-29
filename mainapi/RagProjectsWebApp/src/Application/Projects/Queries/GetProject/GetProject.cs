using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Common.Interfaces;

namespace RagProjectsWebApp.Application.Projects.Queries.GetProject;

public record GetProjectQuery : IRequest<ProjectDto>
{
    public int Id { get; init; }
}

public class GetProjectQueryHandler : IRequestHandler<GetProjectQuery, ProjectDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;

    public GetProjectQueryHandler(IApplicationDbContext context, IUserService userService, IMapper mapper)
    {
        _userService = userService;
        _context = context;
        _mapper = mapper;
    }

    public async Task<ProjectDto> Handle(GetProjectQuery request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var dto = await _context.Projects
            .Where(x => x.Id == request.Id)
            .ProjectTo<ProjectDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, dto, "Project");

        dto.IsAuthor = dto.AuthorId == user.Id;

        foreach (var lecture in dto.Lectures)
        {
            lecture.IsAuthor = dto.IsAuthor;
        }

        return dto;
    }
}
