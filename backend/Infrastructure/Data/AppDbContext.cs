using Microsoft.EntityFrameworkCore;
using ProjectX.Domain.Entities;

namespace ProjectX.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("tb_users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("nome").HasMaxLength(120).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(160).IsRequired();
            entity.Property(e => e.PasswordHash).HasColumnName("senhaHash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime").IsRequired();
            entity.Property(e => e.Permission).HasColumnName("permissao").HasDefaultValue(3).IsRequired();
        });
    }
}
