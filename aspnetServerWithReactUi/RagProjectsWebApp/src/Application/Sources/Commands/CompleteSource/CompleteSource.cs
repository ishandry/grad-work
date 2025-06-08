using RagProjectsWebApp.Application.Common.Interfaces;

namespace RagProjectsWebApp.Application.Sources.Commands.CompleteSource;

public record CompleteSourceCommand : IRequest<Unit>
{
    public string status { get; init; } = string.Empty;
    public int project_id { get; init; }
    public int source_id { get; init; }
}

public class CompleteSourceCommandHandler : IRequestHandler<CompleteSourceCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public CompleteSourceCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(CompleteSourceCommand request, CancellationToken cancellationToken)
    {
        var source = await _context.Sources
            .FirstOrDefaultAsync(s => s.Id == request.source_id && s.ProjectId == request.project_id, cancellationToken);

        Guard.Against.NotFound(request.source_id, source);

        source.IsProcessing = false;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
