using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RagProjectsWebApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueConstaints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectUsers_ProjectId",
                table: "ProjectUsers");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectUsers_ProjectId_UserId_Role",
                table: "ProjectUsers",
                columns: new[] { "ProjectId", "UserId", "Role" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectInvitation_GeneratedCode",
                table: "ProjectInvitation",
                column: "GeneratedCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppUsers_IdentityUserId",
                table: "AppUsers",
                column: "IdentityUserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProjectUsers_ProjectId_UserId_Role",
                table: "ProjectUsers");

            migrationBuilder.DropIndex(
                name: "IX_ProjectInvitation_GeneratedCode",
                table: "ProjectInvitation");

            migrationBuilder.DropIndex(
                name: "IX_AppUsers_IdentityUserId",
                table: "AppUsers");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectUsers_ProjectId",
                table: "ProjectUsers",
                column: "ProjectId");
        }
    }
}
