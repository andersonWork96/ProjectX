using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class RenameUserColumnsToCamel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "senha_hash",
                table: "tb_users",
                newName: "senhaHash");

            migrationBuilder.RenameColumn(
                name: "criado_em",
                table: "tb_users",
                newName: "criadoEm");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "senhaHash",
                table: "tb_users",
                newName: "senha_hash");

            migrationBuilder.RenameColumn(
                name: "criadoEm",
                table: "tb_users",
                newName: "criado_em");
        }
    }
}
