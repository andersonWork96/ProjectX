using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class AddUsernameField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Dropar coluna se já existe (de tentativa anterior)
            migrationBuilder.Sql(@"
                SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tb_users' AND COLUMN_NAME = 'username');
                SET @sql = IF(@col_exists > 0, 'ALTER TABLE tb_users DROP COLUMN username', 'SELECT 1');
                PREPARE stmt FROM @sql;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
            ");

            migrationBuilder.AddColumn<string>(
                name: "username",
                table: "tb_users",
                type: "varchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            // Preencher usernames dos usuários existentes
            migrationBuilder.Sql("UPDATE tb_users SET username = CONCAT(SUBSTRING_INDEX(email, '@', 1), '_', id) WHERE username = ''");

            migrationBuilder.CreateIndex(
                name: "IX_tb_users_username",
                table: "tb_users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tb_users_username",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "username",
                table: "tb_users");
        }
    }
}
