using RagProjectsWebApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RagProjectsWebApp.Infrastructure.Data.Configurations;

public class ProjectUserConfiguration : IEntityTypeConfiguration<ProjectUser>
{
    public void Configure(EntityTypeBuilder<ProjectUser> builder)
    {
        builder.HasIndex(e => new { e.ProjectId, e.UserId, e.Role })
            .IsUnique();
    }
}

