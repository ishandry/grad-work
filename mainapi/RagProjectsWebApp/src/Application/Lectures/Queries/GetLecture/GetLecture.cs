using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Lectures.Queries.GetLecture;

public record GetLectureQuery : IRequest<LectureDto>
{
    public int Id { get; init; }
}

public class GetLectureQueryHandler : IRequestHandler<GetLectureQuery, LectureDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;

    public GetLectureQueryHandler(IApplicationDbContext context, IUserService userService, IMapper mapper)
    {
        _userService = userService;
        _context = context;
        _mapper = mapper;
    }

    public async Task<LectureDto> Handle(GetLectureQuery request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);

        var dto = await _context.Lectures
            .Where(x => x.Id == request.Id)
            .ProjectTo<LectureDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, dto, "Lecture");

        var projectAuthorId = await _context.Projects.Where(x => x.Id == dto.ProjectId).Select(x => x.AuthorId)
            .FirstOrDefaultAsync(cancellationToken);

        dto.IsAuthor = user.Id == projectAuthorId;

        return dto;
    }
}
