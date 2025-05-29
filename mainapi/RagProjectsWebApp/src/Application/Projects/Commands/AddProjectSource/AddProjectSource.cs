using Amazon.Runtime;
using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Application.Common.Security;

namespace RagProjectsWebApp.Application.Projects.Commands.AddProjectSource;

[Authorize]
public record AddProjectSourceCommand : IRequest<int>
{
    public int ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
}

public class AddProjectSourceCommandHandler : IRequestHandler<AddProjectSourceCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;
    private readonly IProcessFileClient _processFileClient;

    public AddProjectSourceCommandHandler(IApplicationDbContext context,
        IUserService userService,
        IProcessFileClient processFileClient)
    {
        _context = context;
        _userService = userService;
        _processFileClient = processFileClient;
    }

    public async Task<int> Handle(AddProjectSourceCommand request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var project = await _context.Projects.Where(p => p.AuthorId == user.Id)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);
        Guard.Against.NotFound(request.ProjectId, project);
        var entity = new Domain.Entities.Source
        {
            Title = request.Title,
            FilePath = request.FilePath,
            FileSize = request.FileSize,
            MimeType = request.MimeType,
            ProjectId = project.Id,
            UploadedAt = DateTime.UtcNow,
            IsProcessing = true,
        };
        _context.Sources.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        _ = _processFileClient.CallProcessFileAsync(
            entity.Id,
            request.FilePath,
            request.ProjectId.ToString(),
            request.Title,
            $"https://app-mydqfjtvb2h3k.azurewebsites.net/api/Sources/complete-source");

        return entity.Id;
    }
}
