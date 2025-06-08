using RagProjectsWebApp.Application.Common.Interfaces;

namespace RagProjectsWebApp.Application.TodoItems.Commands.UpdateItemSubtitle;

public record UpdateItemSubtitleCommand : IRequest<Unit>
{
    public int Id { get; init; }

    public string? SubTitle { get; init; }
}

public class UpdateItemSubtitleCommandHandler : IRequestHandler<UpdateItemSubtitleCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateItemSubtitleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateItemSubtitleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TodoItems
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.SubTitle = request.SubTitle;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
