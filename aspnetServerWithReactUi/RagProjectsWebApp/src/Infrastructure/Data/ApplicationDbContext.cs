using System.Reflection;
using RagProjectsWebApp.Application.Common.Interfaces;
using RagProjectsWebApp.Domain.Entities;
using RagProjectsWebApp.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace RagProjectsWebApp.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<TodoList> TodoLists => Set<TodoList>();

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<Lecture> Lectures => Set<Lecture>();
    public DbSet<LectureVocab> LectureVocabs => Set<LectureVocab>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectInvitation> ProjectInvitation => Set<ProjectInvitation>();
    public DbSet<ProjectUser> ProjectUsers => Set<ProjectUser>();
    public DbSet<Source> Sources => Set<Source>();
    public DbSet<User> AppUsers => Set<User>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
