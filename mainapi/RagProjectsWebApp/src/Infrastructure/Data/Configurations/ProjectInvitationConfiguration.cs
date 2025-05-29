using RagProjectsWebApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RagProjectsWebApp.Infrastructure.Data.Configurations;

public class ProjectInvitationConfiguration : IEntityTypeConfiguration<ProjectInvitation>
{
    public void Configure(EntityTypeBuilder<ProjectInvitation> builder)
    {
        builder.HasIndex(e => e.GeneratedCode)
            .IsUnique();
    }
}

