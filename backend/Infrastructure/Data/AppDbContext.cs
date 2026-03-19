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
    public DbSet<CreatorPlan> CreatorPlans => Set<CreatorPlan>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostImage> PostImages => Set<PostImage>();
    public DbSet<ExclusiveContent> ExclusiveContents => Set<ExclusiveContent>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<ChatRequest> ChatRequests => Set<ChatRequest>();
    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SiteVisit> SiteVisits => Set<SiteVisit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ===== USER =====
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("tb_users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("nome").HasMaxLength(120).IsRequired();
            entity.Property(e => e.Username).HasColumnName("username").HasMaxLength(30).HasDefaultValue("").IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(160).IsRequired();
            entity.Property(e => e.PasswordHash).HasColumnName("senhaHash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime").IsRequired();
            entity.Property(e => e.Permission).HasColumnName("permissao").HasDefaultValue(3).IsRequired();
            entity.Property(e => e.IsCreator).HasColumnName("isCriador").HasDefaultValue(false);
            entity.Property(e => e.AvatarUrl).HasColumnName("avatarUrl").HasColumnType("longtext");
            entity.Property(e => e.BannerUrl).HasColumnName("bannerUrl").HasColumnType("longtext");
            entity.Property(e => e.Bio).HasColumnName("bio").HasMaxLength(500);
            entity.Property(e => e.City).HasColumnName("cidade").HasMaxLength(100);
            entity.Property(e => e.Gender).HasColumnName("genero").HasMaxLength(20);
            entity.Property(e => e.BirthDate).HasColumnName("dataNascimento").HasColumnType("date");
            entity.Property(e => e.Phone).HasColumnName("telefone").HasMaxLength(20);
            entity.Property(e => e.LastSeenAt).HasColumnName("ultimoAcessoEm").HasColumnType("datetime");
            entity.Property(e => e.Latitude).HasColumnName("latitude");
            entity.Property(e => e.Longitude).HasColumnName("longitude");
            entity.Property(e => e.LastLocationAt).HasColumnName("ultimaLocalizacaoEm").HasColumnType("datetime");
            entity.Property(e => e.PlatformPlan).HasColumnName("planoPlatforma").HasMaxLength(20).HasDefaultValue("free").IsRequired();
            entity.Property(e => e.PlatformPlanExpiresAt).HasColumnName("planoPlatformaExpiraEm").HasColumnType("datetime");
        });

        // ===== CREATOR PLAN =====
        modelBuilder.Entity<CreatorPlan>(entity =>
        {
            entity.ToTable("tb_creator_plans");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatorId).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatorId).HasColumnName("criadorId").IsRequired();
            entity.Property(e => e.FanPrice).HasColumnName("precoFa").HasColumnType("decimal(10,2)");
            entity.Property(e => e.VipPrice).HasColumnName("precoVip").HasColumnType("decimal(10,2)");
            entity.Property(e => e.UpdatedAt).HasColumnName("atualizadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.Creator)
                .WithOne(u => u.CreatorPlan)
                .HasForeignKey<CreatorPlan>(e => e.CreatorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== POST (feed público) =====
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
            entity.Property(e => e.ImageUrl).HasColumnName("imageUrl").HasColumnType("longtext").IsRequired();
            entity.Property(e => e.Order).HasColumnName("ordem").HasDefaultValue(0);

            entity.HasOne(e => e.Post)
                .WithMany(p => p.Images)
                .HasForeignKey(e => e.PostId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== EXCLUSIVE CONTENT (perfil privado) =====
        modelBuilder.Entity<ExclusiveContent>(entity =>
        {
            entity.ToTable("tb_exclusive_contents");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatorId).HasColumnName("criadorId").IsRequired();
            entity.Property(e => e.Caption).HasColumnName("legenda").HasMaxLength(500);
            entity.Property(e => e.MediaType).HasColumnName("tipoMidia").HasMaxLength(10).IsRequired();
            entity.Property(e => e.MediaUrl).HasColumnName("midiaUrl").HasColumnType("longtext").IsRequired();
            entity.Property(e => e.MinPlan).HasColumnName("planoMinimo").HasMaxLength(10).HasDefaultValue("fan").IsRequired();
            entity.Property(e => e.DisplayOrder).HasColumnName("ordem").HasDefaultValue(0);
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");

            entity.HasOne(e => e.Creator)
                .WithMany(u => u.ExclusiveContents)
                .HasForeignKey(e => e.CreatorId)
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

        // ===== SUBSCRIPTION (assinatura de criador) =====
        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.ToTable("tb_subscriptions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.SubscriberId, e.CreatorId }).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SubscriberId).HasColumnName("assinanteId").IsRequired();
            entity.Property(e => e.CreatorId).HasColumnName("criadorId").IsRequired();
            entity.Property(e => e.PlanType).HasColumnName("tipoPlano").HasMaxLength(10).IsRequired();
            entity.Property(e => e.StartDate).HasColumnName("dataInicio").HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnName("dataFim").HasColumnType("datetime");
            entity.Property(e => e.PaymentStatus).HasColumnName("statusPagamento").HasMaxLength(20).IsRequired();

            entity.HasOne(e => e.Subscriber)
                .WithMany()
                .HasForeignKey(e => e.SubscriberId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Creator)
                .WithMany()
                .HasForeignKey(e => e.CreatorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===== CHAT REQUEST =====
        modelBuilder.Entity<ChatRequest>(entity =>
        {
            entity.ToTable("tb_chat_requests");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.FromUserId).HasColumnName("deUsuarioId").IsRequired();
            entity.Property(e => e.ToCreatorId).HasColumnName("paraCriadorId").IsRequired();
            entity.Property(e => e.Message).HasColumnName("mensagem").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("pending").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("criadoEm").HasColumnType("datetime");
            entity.Property(e => e.RespondedAt).HasColumnName("respondidoEm").HasColumnType("datetime");

            entity.HasOne(e => e.FromUser)
                .WithMany()
                .HasForeignKey(e => e.FromUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ToCreator)
                .WithMany()
                .HasForeignKey(e => e.ToCreatorId)
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
            entity.Property(e => e.IsVip).HasColumnName("isVip").HasDefaultValue(false);
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

        // ===== SITE VISIT =====
        modelBuilder.Entity<SiteVisit>(entity =>
        {
            entity.ToTable("tb_site_visits");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.IpAddress).HasColumnName("ip").HasMaxLength(50);
            entity.Property(e => e.VisitedAt).HasColumnName("visitadoEm").HasColumnType("datetime");
        });
    }
}
