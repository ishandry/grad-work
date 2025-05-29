using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Account.Queries.GetAccountInfo;

namespace RagProjectsWebApp.Web.Endpoints;

public class Accounts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetAccountInfo, "my-account");
    }

    public async Task<UserAccountDto> GetAccountInfo(ISender sender)
    {
        var result = await sender.Send(new GetAccountInfoQuery());
        return result;
    }
}
