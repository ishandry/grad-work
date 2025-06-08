using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Services
{
    public class UserService : IUserService
    {
        private readonly IUser _user;
        private readonly IApplicationDbContext _context;
        public UserService(IUser user, IApplicationDbContext context)
        {
            _user = user;
            _context = context;
        }
        public async Task<User> GetOrCreateAppUser(CancellationToken cancellationToken)
        {
            var identityId = _user.Id;
            Guard.Against.NullOrEmpty(identityId, nameof(identityId));
            var appUser = await _context.AppUsers
                .FirstOrDefaultAsync(x => x.IdentityUserId == identityId, cancellationToken);
            if (appUser == null)
            {
                appUser = new User
                {
                    IdentityUserId = identityId,
                    ProjectsLimit = 3,
                };
                _context.AppUsers.Add(appUser);
                await _context.SaveChangesAsync(cancellationToken);
            }
            return appUser;
        }
    }
}
