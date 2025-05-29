using RagProjectsWebApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace RagProjectsWebApp.Infrastructure.Data.Configurations;

public class LectureVocabConfiguration : IEntityTypeConfiguration<LectureVocab>
{
    public void Configure(EntityTypeBuilder<LectureVocab> builder)
    {
        builder.HasIndex(e => new { e.Word, e.LectureId })
            .IsUnique();
    }
}
