using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RagProjectsWebApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixVocabIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LectureVocabs_Word",
                table: "LectureVocabs");

            migrationBuilder.CreateIndex(
                name: "IX_LectureVocabs_Word_LectureId",
                table: "LectureVocabs",
                columns: new[] { "Word", "LectureId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LectureVocabs_Word_LectureId",
                table: "LectureVocabs");

            migrationBuilder.CreateIndex(
                name: "IX_LectureVocabs_Word",
                table: "LectureVocabs",
                column: "Word",
                unique: true);
        }
    }
}
