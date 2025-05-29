using RagProjectsWebApp.Application.Common.Interfaces;

namespace RagProjectsWebApp.Application.Lectures.Commands.SetVocabDescription;

public record SetVocabDescriptionCommand : IRequest<Unit>
{
    public int VocabId { get; init; }
    public string Description { get; init; } = string.Empty;
}

public class SetVocabDescriptionCommandHandler : IRequestHandler<SetVocabDescriptionCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public SetVocabDescriptionCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(SetVocabDescriptionCommand request, CancellationToken cancellationToken)
    {
        var vocab = await _context.LectureVocabs.FirstOrDefaultAsync(x => x.Id == request.VocabId, cancellationToken);
        Guard.Against.NotFound(request.VocabId, vocab);
        vocab.Description = request.Description;
        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
