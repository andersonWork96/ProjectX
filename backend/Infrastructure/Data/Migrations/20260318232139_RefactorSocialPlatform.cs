using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class RefactorSocialPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tb_subscriptions_tb_users_userId",
                table: "tb_subscriptions");

            migrationBuilder.DropTable(
                name: "tb_companion_profiles");

            migrationBuilder.DropTable(
                name: "tb_interests");

            migrationBuilder.DropColumn(
                name: "tipo",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "plano",
                table: "tb_subscriptions");

            migrationBuilder.RenameColumn(
                name: "planoExpiraEm",
                table: "tb_users",
                newName: "planoPlatformaExpiraEm");

            migrationBuilder.RenameColumn(
                name: "plano",
                table: "tb_users",
                newName: "planoPlatforma");

            migrationBuilder.RenameColumn(
                name: "userId",
                table: "tb_subscriptions",
                newName: "criadorId");

            migrationBuilder.RenameIndex(
                name: "IX_tb_subscriptions_userId",
                table: "tb_subscriptions",
                newName: "IX_tb_subscriptions_criadorId");

            migrationBuilder.AddColumn<string>(
                name: "bannerUrl",
                table: "tb_users",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "isCriador",
                table: "tb_users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "assinanteId",
                table: "tb_subscriptions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "tipoPlano",
                table: "tb_subscriptions",
                type: "varchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "isVip",
                table: "tb_chats",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "tb_chat_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    deUsuarioId = table.Column<int>(type: "int", nullable: false),
                    paraCriadorId = table.Column<int>(type: "int", nullable: false),
                    mensagem = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false, defaultValue: "pending")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false),
                    respondidoEm = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_chat_requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_chat_requests_tb_users_deUsuarioId",
                        column: x => x.deUsuarioId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tb_chat_requests_tb_users_paraCriadorId",
                        column: x => x.paraCriadorId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_creator_plans",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    criadorId = table.Column<int>(type: "int", nullable: false),
                    precoFa = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    precoVip = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    atualizadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_creator_plans", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_creator_plans_tb_users_criadorId",
                        column: x => x.criadorId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_exclusive_contents",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    criadorId = table.Column<int>(type: "int", nullable: false),
                    legenda = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tipoMidia = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    midiaUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    planoMinimo = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false, defaultValue: "fan")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_exclusive_contents", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_exclusive_contents_tb_users_criadorId",
                        column: x => x.criadorId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_tb_subscriptions_assinanteId_criadorId",
                table: "tb_subscriptions",
                columns: new[] { "assinanteId", "criadorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_chat_requests_deUsuarioId",
                table: "tb_chat_requests",
                column: "deUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_chat_requests_paraCriadorId",
                table: "tb_chat_requests",
                column: "paraCriadorId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_creator_plans_criadorId",
                table: "tb_creator_plans",
                column: "criadorId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_exclusive_contents_criadorId",
                table: "tb_exclusive_contents",
                column: "criadorId");

            migrationBuilder.AddForeignKey(
                name: "FK_tb_subscriptions_tb_users_assinanteId",
                table: "tb_subscriptions",
                column: "assinanteId",
                principalTable: "tb_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_tb_subscriptions_tb_users_criadorId",
                table: "tb_subscriptions",
                column: "criadorId",
                principalTable: "tb_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_tb_subscriptions_tb_users_assinanteId",
                table: "tb_subscriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_tb_subscriptions_tb_users_criadorId",
                table: "tb_subscriptions");

            migrationBuilder.DropTable(
                name: "tb_chat_requests");

            migrationBuilder.DropTable(
                name: "tb_creator_plans");

            migrationBuilder.DropTable(
                name: "tb_exclusive_contents");

            migrationBuilder.DropIndex(
                name: "IX_tb_subscriptions_assinanteId_criadorId",
                table: "tb_subscriptions");

            migrationBuilder.DropColumn(
                name: "bannerUrl",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "isCriador",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "assinanteId",
                table: "tb_subscriptions");

            migrationBuilder.DropColumn(
                name: "tipoPlano",
                table: "tb_subscriptions");

            migrationBuilder.DropColumn(
                name: "isVip",
                table: "tb_chats");

            migrationBuilder.RenameColumn(
                name: "planoPlatformaExpiraEm",
                table: "tb_users",
                newName: "planoExpiraEm");

            migrationBuilder.RenameColumn(
                name: "planoPlatforma",
                table: "tb_users",
                newName: "plano");

            migrationBuilder.RenameColumn(
                name: "criadorId",
                table: "tb_subscriptions",
                newName: "userId");

            migrationBuilder.RenameIndex(
                name: "IX_tb_subscriptions_criadorId",
                table: "tb_subscriptions",
                newName: "IX_tb_subscriptions_userId");

            migrationBuilder.AddColumn<string>(
                name: "tipo",
                table: "tb_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "client")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "plano",
                table: "tb_subscriptions",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_companion_profiles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    disponivelPara = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false),
                    faixaPreco = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    avaliacao = table.Column<double>(type: "double", nullable: false, defaultValue: 0.0),
                    totalAvaliacoes = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    verificado = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_companion_profiles", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_companion_profiles_tb_users_userId",
                        column: x => x.userId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_interests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    fromUserId = table.Column<int>(type: "int", nullable: false),
                    toUserId = table.Column<int>(type: "int", nullable: false),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_interests", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_interests_tb_users_fromUserId",
                        column: x => x.fromUserId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tb_interests_tb_users_toUserId",
                        column: x => x.toUserId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_tb_companion_profiles_userId",
                table: "tb_companion_profiles",
                column: "userId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_interests_fromUserId_toUserId",
                table: "tb_interests",
                columns: new[] { "fromUserId", "toUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_interests_toUserId",
                table: "tb_interests",
                column: "toUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_tb_subscriptions_tb_users_userId",
                table: "tb_subscriptions",
                column: "userId",
                principalTable: "tb_users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
