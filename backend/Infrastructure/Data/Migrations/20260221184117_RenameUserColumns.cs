using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class RenameUserColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Email",
                table: "tb_users",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "tb_users",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "tb_users",
                newName: "senha_hash");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "tb_users",
                newName: "nome");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "tb_users",
                newName: "criado_em");

            migrationBuilder.RenameIndex(
                name: "IX_tb_users_Email",
                table: "tb_users",
                newName: "IX_tb_users_email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "email",
                table: "tb_users",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "tb_users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "senha_hash",
                table: "tb_users",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "nome",
                table: "tb_users",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "criado_em",
                table: "tb_users",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "IX_tb_users_email",
                table: "tb_users",
                newName: "IX_tb_users_Email");
        }
    }
}
