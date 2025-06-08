using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RagProjectsWebApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SourceProcessingStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsProcessing",
                table: "Sources",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsProcessing",
                table: "Sources");
        }
    }
}
