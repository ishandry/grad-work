using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Application.Common.Security;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Lectures.Commands.UpdateLecture;

[Authorize]
public record UpdateLectureCommand : IRequest<Unit>
{
    public int Id { get; init; }
    public string? Title { get; init; }
    public string? TextContent { get; init; }
    public string? OriginalFilePath { get; init; }
    public List<string>? VocabWords { get; init; }
}

public class UpdateLectureCommandHandler : IRequestHandler<UpdateLectureCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;

    public UpdateLectureCommandHandler(
        IApplicationDbContext context,
        IUserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public async Task<Unit> Handle(UpdateLectureCommand request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);
        var lecture = await _context.Lectures
            .Include(l => l.Vocab)
            .Where(l => l.Project.AuthorId == user.Id)
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
        Guard.Against.NotFound(request.Id, lecture);

        if (request.Title is not null)
            lecture.Title = request.Title;

        if (request.TextContent is not null)
            lecture.TextContent = request.TextContent;

        if (request.OriginalFilePath is not null)
            lecture.OriginalFilePath = request.OriginalFilePath;

        if (request.VocabWords is not null)
        {
            var uniqueWords = request.VocabWords
                .Select(w => w.ToLower())
                .Distinct()
                .ToList();

            var wordsToAdd = uniqueWords
                .Where(w => !lecture.Vocab.Any(v => v.Word == w))
                .Select(w => new LectureVocab
                {
                    Word = w,
                    LectureId = lecture.Id
                })
                .ToList();

            _context.LectureVocabs.AddRange(wordsToAdd);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
