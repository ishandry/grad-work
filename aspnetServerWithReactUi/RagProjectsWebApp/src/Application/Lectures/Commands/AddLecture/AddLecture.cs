using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Application.Common.Security;
using RagProjectsWebApp.Application.Common.Services;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Lectures.Commands.AddLecture;

[Authorize]
public record AddLectureCommand : IRequest<int>
{
    public string Title { get; init; } = string.Empty;
    public int ProjectId { get; init; }
    public string? TextContent { get; init; }
    public List<string>? VocabWords { get; init; }
}

public class AddLectureCommandHandler : IRequestHandler<AddLectureCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;

    public AddLectureCommandHandler(IApplicationDbContext context, IUserService userService)
    {
        _userService = userService;
        _context = context;
    }

    public async Task<int> Handle(AddLectureCommand request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var index = await _context.Lectures
            .Where(x => x.ProjectId == request.ProjectId)
            .Select(x => x.OrderIndex)
            .OrderByDescending(x => x)
            .FirstOrDefaultAsync(cancellationToken);
        var entity = new Domain.Entities.Lecture
        {
            ProjectId = request.ProjectId,
            Title = request.Title,
            OrderIndex = index + 1,
            TextContent = request.TextContent,
        };

        if (request.VocabWords is not null)
        {
            var uniqueWords = request.VocabWords
                .Select(w => w.ToLower())
                .Distinct()
                .ToList();
            var wordsToAdd = uniqueWords
                .Select(w => new LectureVocab
                {
                    Word = w,
                    Lecture = entity,
                })
                .ToList();

            _context.LectureVocabs.AddRange(wordsToAdd);
        }

        _context.Lectures.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity.Id;
    }
}
