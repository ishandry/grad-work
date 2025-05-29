using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Projects.Queries.GetAllProjects;
using RagProjectsWebApp.Application.Projects.Queries.GetProject;
using RagProjectsWebApp.Application.Projects.Commands.CreateProject;
using RagProjectsWebApp.Application.Projects.Commands.AddProjectSource;
using RagProjectsWebApp.Application.Projects.Commands.CreateSourceSignedUrl;

namespace RagProjectsWebApp.Web.Endpoints;

public class Projects : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetAllProjects, "get-all")
            .MapGet(GetProject, "{id}")
            .MapPost(CreateProject, "create")
            .MapPost(CreateSignedUrl, "create-signed-url")
            .MapPost(AddProjectSource, "add-source");
    }

    public async Task<List<ProjectBriefDto>> GetAllProjects(ISender sender)
    {
        var result = await sender.Send(new GetAllProjectsQuery());
        return result;
    }

    public async Task<ProjectDto> GetProject(ISender sender, int id)
    {
        var result = await sender.Send(new GetProjectQuery { Id = id });
        return result;
    }

    public async Task<int> CreateProject(ISender sender, CreateProjectCommand command)
    {
        var id = await sender.Send(command);
        return id;
    }

    public async Task<int> AddProjectSource(ISender sender, AddProjectSourceCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }

    public async Task<SignedUrlDto> CreateSignedUrl(ISender sender, CreateSourceSignedUrlCommand command)
    {
        var result = await sender.Send(command);
        return result;
    }
}
