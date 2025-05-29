using RagProjectsWebApp.Domain.Entities;

namespace RagProjectsWebApp.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }
    DbSet<Lecture> Lectures { get; }
    DbSet<LectureVocab> LectureVocabs { get; }
    DbSet<Project> Projects { get; }
    DbSet<ProjectInvitation> ProjectInvitation { get; }
    DbSet<ProjectUser> ProjectUsers { get; }
    DbSet<Source> Sources { get; }
    DbSet<User> AppUsers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
