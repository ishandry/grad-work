using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Application.Common.Security;

namespace RagProjectsWebApp.Application.Projects.Commands.CreateProject;

[Authorize]
public record CreateProjectCommand : IRequest<int>
{
    public required string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;
    private readonly IUserService _userService;

    public CreateProjectCommandHandler(IApplicationDbContext context, IUser user, IUserService userService)
    {
        _context = context;
        _user = user;
        _userService = userService;
    }

    public async Task<int> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var projectCount = await _context.Projects.CountAsync(x => x.AuthorId == user.Id, cancellationToken);
        if (projectCount >= user.ProjectsLimit)
        {
            throw new Exception("Project limit reached");
        }

        user.ProjectsLimit--;
        var newProject = new Domain.Entities.Project
        {
            Name = request.Name,
            Description = request.Description,
            AuthorId = user.Id,
        };

        _context.Projects.Add(newProject);

        await _context.SaveChangesAsync(cancellationToken);

        return newProject.Id;
    }
}
