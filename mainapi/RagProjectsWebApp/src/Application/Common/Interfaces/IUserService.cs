using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Interfaces
{
    public interface IUserService
    {
        Task<User> GetOrCreateAppUser(CancellationToken cancellationToken);
    }
}
