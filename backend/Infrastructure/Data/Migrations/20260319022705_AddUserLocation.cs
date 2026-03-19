using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProjectX.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "latitude",
                table: "tb_users",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "longitude",
                table: "tb_users",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ultimaLocalizacaoEm",
                table: "tb_users",
                type: "datetime",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "latitude",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "longitude",
                table: "tb_users");

            migrationBuilder.DropColumn(
                name: "ultimaLocalizacaoEm",
                table: "tb_users");
        }
    }
}
