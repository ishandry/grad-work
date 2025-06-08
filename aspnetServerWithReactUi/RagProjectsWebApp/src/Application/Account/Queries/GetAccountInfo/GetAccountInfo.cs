using RagProjectsWebApp.Application.Common.Dtos;
using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Application.Common.Security;

namespace RagProjectsWebApp.Application.Account.Queries.GetAccountInfo;

[Authorize]
public record GetAccountInfoQuery : IRequest<UserAccountDto>
{
}

public class GetAccountInfoQueryHandler : IRequestHandler<GetAccountInfoQuery, UserAccountDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;

    public GetAccountInfoQueryHandler(IApplicationDbContext context, IUserService userService, IMapper mapper)
    {
        _userService = userService;
        _context = context;
        _mapper = mapper;
    }

    public async Task<UserAccountDto> Handle(GetAccountInfoQuery request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetOrCreateAppUser(cancellationToken);

        var dto = await _context.AppUsers
            .Where(x => x.Id == user.Id)
            .ProjectTo<UserAccountDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);

        Guard.Against.Null(dto);

        return dto;
    }
}
