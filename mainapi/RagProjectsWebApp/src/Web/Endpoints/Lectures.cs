using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Lectures.Queries.GetLecture;
using RagProjectsWebApp.Application.Lectures.Commands.AddLecture;
using RagProjectsWebApp.Application.Lectures.Commands.SetVocabDescription;
using RagProjectsWebApp.Application.Lectures.Commands.UpdateLecture;
using RagProjectsWebApp.Application.Projects.Commands.CreateSourceSignedUrl;
using RagProjectsWebApp.Application.Lectures.Commands.CreateLectureSourceSignedUrl;

namespace RagProjectsWebApp.Web.Endpoints;

public class Lectures : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetLecture, "{id}")
            .MapPost(AddLecture, "add")
            .MapPost(UpdateLecture, "update")
            .MapPost(CreateLectureSourceSignedUrl, "create-lecture-source-signed-url")
            .MapPost(SetVocabDescription, "set-vocab-description");
    }

    public async Task<LectureDto> GetLecture(ISender sender, int id)
    {
        var result = await sender.Send(new GetLectureQuery { Id = id });
        return result;
    }

    public async Task<int> AddLecture(ISender sender, AddLectureCommand command)
    {
        var id = await sender.Send(command);
        return id;
    }

    public async Task<IResult> SetVocabDescription(ISender sender, SetVocabDescriptionCommand command)
    {
        await sender.Send(command);
        return Results.Ok();
    }

    public async Task<IResult> UpdateLecture(ISender sender, UpdateLectureCommand command)
    {
        await sender.Send(command);
        return Results.Ok();
    }

    public async Task<SignedUrlDto> CreateLectureSourceSignedUrl(ISender sender, CreateLectureSourceSignedUrlCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }
}
