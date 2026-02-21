using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPermission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "permissao",
                table: "tb_users",
                type: "int",
                nullable: false,
                defaultValue: 3);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "permissao",
                table: "tb_users");
        }
    }
}
