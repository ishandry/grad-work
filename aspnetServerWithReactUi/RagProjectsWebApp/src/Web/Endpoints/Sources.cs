using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Account.Queries.GetAccountInfo;
using RagProjectsWebApp.Application.Sources.Commands.CompleteSource;
using RagProjectsWebApp.Application.Lectures.Commands.UpdateLecture;

namespace RagProjectsWebApp.Web.Endpoints;

public class Sources : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CompleteSource, "complete-source");
    }

    public async Task<IResult> CompleteSource(ISender sender, CompleteSourceCommand command)
    {
        await sender.Send(command);
        return Results.Ok();
    }
}
