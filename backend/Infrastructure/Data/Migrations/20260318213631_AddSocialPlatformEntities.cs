using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialPlatformEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "avatarUrl",
                table: "tb_users",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "bio",
                table: "tb_users",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "cidade",
                table: "tb_users",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "dataNascimento",
                table: "tb_users",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "genero",
                table: "tb_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "plano",
                table: "tb_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "free")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "planoExpiraEm",
                table: "tb_users",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "telefone",
                table: "tb_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "tipo",
                table: "tb_users",
                type: "varchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "client")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_chats",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    user1Id = table.Column<int>(type: "int", nullable: false),
                    user2Id = table.Column<int>(type: "int", nullable: false),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false),
                    ultimaMensagemEm = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_chats", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_chats_tb_users_user1Id",
                        column: x => x.user1Id,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tb_chats_tb_users_user2Id",
                        column: x => x.user2Id,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_companion_profiles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    faixaPreco = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    verificado = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    avaliacao = table.Column<double>(type: "double", nullable: false, defaultValue: 0.0),
                    totalAvaliacoes = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    disponivelPara = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
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
                name: "tb_follows",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    followerId = table.Column<int>(type: "int", nullable: false),
                    followingId = table.Column<int>(type: "int", nullable: false),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_follows", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_follows_tb_users_followerId",
                        column: x => x.followerId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_tb_follows_tb_users_followingId",
                        column: x => x.followingId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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

            migrationBuilder.CreateTable(
                name: "tb_notifications",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    tipo = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    referenciaId = table.Column<int>(type: "int", nullable: true),
                    mensagem = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    lido = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_notifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_notifications_tb_users_userId",
                        column: x => x.userId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_posts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    legenda = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_posts", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_posts_tb_users_userId",
                        column: x => x.userId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_subscriptions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    plano = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    dataInicio = table.Column<DateTime>(type: "datetime", nullable: false),
                    dataFim = table.Column<DateTime>(type: "datetime", nullable: true),
                    statusPagamento = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_subscriptions_tb_users_userId",
                        column: x => x.userId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_messages",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    chatId = table.Column<int>(type: "int", nullable: false),
                    senderId = table.Column<int>(type: "int", nullable: false),
                    texto = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false),
                    lidoEm = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_messages_tb_chats_chatId",
                        column: x => x.chatId,
                        principalTable: "tb_chats",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tb_messages_tb_users_senderId",
                        column: x => x.senderId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_comments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    postId = table.Column<int>(type: "int", nullable: false),
                    texto = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_comments", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_comments_tb_posts_postId",
                        column: x => x.postId,
                        principalTable: "tb_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tb_comments_tb_users_userId",
                        column: x => x.userId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_likes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    userId = table.Column<int>(type: "int", nullable: false),
                    postId = table.Column<int>(type: "int", nullable: false),
                    criadoEm = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_likes", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_likes_tb_posts_postId",
                        column: x => x.postId,
                        principalTable: "tb_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_tb_likes_tb_users_userId",
                        column: x => x.userId,
                        principalTable: "tb_users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "tb_post_images",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    postId = table.Column<int>(type: "int", nullable: false),
                    imageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ordem = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tb_post_images", x => x.id);
                    table.ForeignKey(
                        name: "FK_tb_post_images_tb_posts_postId",
                        column: x => x.postId,
                        principalTable: "tb_posts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_tb_chats_user1Id_user2Id",
                table: "tb_chats",
                columns: new[] { "user1Id", "user2Id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_chats_user2Id",
                table: "tb_chats",
                column: "user2Id");

            migrationBuilder.CreateIndex(
                name: "IX_tb_comments_postId",
                table: "tb_comments",
                column: "postId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_comments_userId",
                table: "tb_comments",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_companion_profiles_userId",
                table: "tb_companion_profiles",
                column: "userId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_follows_followerId_followingId",
                table: "tb_follows",
                columns: new[] { "followerId", "followingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_follows_followingId",
                table: "tb_follows",
                column: "followingId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_interests_fromUserId_toUserId",
                table: "tb_interests",
                columns: new[] { "fromUserId", "toUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_interests_toUserId",
                table: "tb_interests",
                column: "toUserId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_likes_postId",
                table: "tb_likes",
                column: "postId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_likes_userId_postId",
                table: "tb_likes",
                columns: new[] { "userId", "postId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tb_messages_chatId",
                table: "tb_messages",
                column: "chatId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_messages_senderId",
                table: "tb_messages",
                column: "senderId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_notifications_userId",
                table: "tb_notifications",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_post_images_postId",
                table: "tb_post_images",
                column: "postId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_posts_userId",
                table: "tb_posts",
                column: "userId");

            migrationBuilder.CreateIndex(
                name: "IX_tb_subscriptions_userId",
                table: "tb_subscriptions",
                column: "userId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tb_comments");

            migrationBuilder.DropTable(
                name: "tb_companion_profiles");

            migrationBuilder.DropTable(
                name: "tb_follows");

            migrationBuilder.DropTable(
                name: "tb_interests");

            migrationBuilder.DropTable(
                name: "tb_likes");

            migrationBuilder.DropTable(
                name: "tb_messages");

            migrationBuilder.DropTable(
                name: "tb_notifications");

            migrationBuilder.DropTable(
                name: "tb_post_images");

            migrationBuilder.DropTable(
                name: "tb_subscriptions");

            migrationBuilder.DropTable(
                name: "tb_chats");

            migrationBuilder.DropTable(
                name: "tb_posts");

            migrationBuilder.DropColumn(
                name: "avatarUrl",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "bio",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "cidade",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "dataNascimento",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "genero",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "plano",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "planoExpiraEm",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "telefone",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "tipo",
                table: "tb_users");
        }
    }
}
