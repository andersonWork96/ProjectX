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
    public DbSet<CompanionProfile> CompanionProfiles => Set<CompanionProfile>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostImage> PostImages => Set<PostImage>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Interest> Interests => Set<Interest>();
    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ===== USER =====
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
            entity.Property(e => e.Type).HasColumnName("tipo").HasMaxLength(20).HasDefaultValue("client").IsRequired();
            entity.Property(e => e.AvatarUrl).HasColumnName("avatarUrl").HasMaxLength(500);
            entity.Property(e => e.Bio).HasColumnName("bio").HasMaxLength(500);
            entity.Property(e => e.City).HasColumnName("cidade").HasMaxLength(100);
            entity.Property(e => e.Gender).HasColumnName("genero").HasMaxLength(20);
            entity.Property(e => e.BirthDate).HasColumnName("dataNascimento").HasColumnType("date");
            entity.Property(e => e.Phone).HasColumnName("telefone").HasMaxLength(20);
            entity.Property(e => e.Plan).HasColumnName("plano").HasMaxLength(20).HasDefaultValue("free").IsRequired();
            entity.Property(e => e.PlanExpiresAt).HasColumnName("planoExpiraEm").HasColumnType("datetime");
        });

        // ===== COMPANION PROFILE =====
        modelBuilder.Entity<CompanionProfile>(entity =>
        {
            entity.ToTable("tb_companion_profiles");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId").IsRequired();
            entity.Property(e => e.PriceRange).HasColumnName("faixaPreco").HasMaxLength(50);
            entity.Property(e => e.Verified).HasColumnName("verificado").HasDefaultValue(false);
            entity.Property(e => e.Rating).HasColumnName("avaliacao").HasDefaultValue(0.0);
            entity.Property(e => e.RatingCount).HasColumnName("totalAvaliacoes").HasDefaultValue(0);
            entity.Property(e => e.AvailableFor).HasColumnName("disponivelPara").HasMaxLength(300);
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.User)
                .WithOne(u => u.CompanionProfile)
                .HasForeignKey<CompanionProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== POST =====
        modelBuilder.Entity<Post>(entity =>
        {
            entity.ToTable("tb_posts");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId").IsRequired();
            entity.Property(e => e.Caption).HasColumnName("legenda").HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Posts)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== POST IMAGE =====
        modelBuilder.Entity<PostImage>(entity =>
        {
            entity.ToTable("tb_post_images");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PostId).HasColumnName("postId").IsRequired();
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Order).HasColumnName("ordem").HasDefaultValue(0);

            entity.HasOne(e => e.Post)
                .WithMany(p => p.Images)
                .HasForeignKey(e => e.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== LIKE =====
        modelBuilder.Entity<Like>(entity =>
        {
            entity.ToTable("tb_likes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.PostId }).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId").IsRequired();
            entity.Property(e => e.PostId).HasColumnName("postId").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(e => e.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== COMMENT =====
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.ToTable("tb_comments");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId").IsRequired();
            entity.Property(e => e.PostId).HasColumnName("postId").IsRequired();
            entity.Property(e => e.Text).HasColumnName("texto").HasMaxLength(500).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(e => e.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== FOLLOW =====
        modelBuilder.Entity<Follow>(entity =>
        {
            entity.ToTable("tb_follows");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.FollowerId, e.FollowingId }).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FollowerId).HasColumnName("followerId").IsRequired();
            entity.Property(e => e.FollowingId).HasColumnName("followingId").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.Follower)
                .WithMany(u => u.Following)
                .HasForeignKey(e => e.FollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Following)
                .WithMany(u => u.Followers)
                .HasForeignKey(e => e.FollowingId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== INTEREST =====
        modelBuilder.Entity<Interest>(entity =>
        {
            entity.ToTable("tb_interests");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.FromUserId, e.ToUserId }).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FromUserId).HasColumnName("fromUserId").IsRequired();
            entity.Property(e => e.ToUserId).HasColumnName("toUserId").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.FromUser)
                .WithMany(u => u.InterestsSent)
                .HasForeignKey(e => e.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToUser)
                .WithMany(u => u.InterestsReceived)
                .HasForeignKey(e => e.ToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== CHAT =====
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.ToTable("tb_chats");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.User1Id, e.User2Id }).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.User1Id).HasColumnName("user1Id").IsRequired();
            entity.Property(e => e.User2Id).HasColumnName("user2Id").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");
            entity.Property(e => e.LastMessageAt).HasColumnName("ultimaMensagemEm").HasColumnType("datetime");

            entity.HasOne(e => e.User1)
                .WithMany()
                .HasForeignKey(e => e.User1Id)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User2)
                .WithMany()
                .HasForeignKey(e => e.User2Id)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== MESSAGE =====
        modelBuilder.Entity<Message>(entity =>
        {
            entity.ToTable("tb_messages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ChatId).HasColumnName("chatId").IsRequired();
            entity.Property(e => e.SenderId).HasColumnName("senderId").IsRequired();
            entity.Property(e => e.Text).HasColumnName("texto").HasMaxLength(2000).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");
            entity.Property(e => e.ReadAt).HasColumnName("lidoEm").HasColumnType("datetime");

            entity.HasOne(e => e.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(e => e.ChatId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Sender)
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== NOTIFICATION =====
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("tb_notifications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId").IsRequired();
            entity.Property(e => e.Type).HasColumnName("tipo").HasMaxLength(30).IsRequired();
            entity.Property(e => e.ReferenceId).HasColumnName("referenciaId");
            entity.Property(e => e.MessageText).HasColumnName("mensagem").HasMaxLength(300).IsRequired();
            entity.Property(e => e.Read).HasColumnName("lido").HasDefaultValue(false);
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== SUBSCRIPTION =====
        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.ToTable("tb_subscriptions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId").IsRequired();
            entity.Property(e => e.Plan).HasColumnName("plano").HasMaxLength(20).IsRequired();
            entity.Property(e => e.StartDate).HasColumnName("dataInicio").HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnName("dataFim").HasColumnType("datetime");
            entity.Property(e => e.PaymentStatus).HasColumnName("statusPagamento").HasMaxLength(20).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
