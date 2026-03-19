namespace ProjectX.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int Permission { get; set; } = 3;

    public bool IsCreator { get; set; }
    public string? AvatarUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Phone { get; set; }

    // Status online
    public DateTime? LastSeenAt { get; set; }

    // Localização
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public DateTime? LastLocationAt { get; set; }

    // Plano da plataforma (free, premium, elite)
    public string PlatformPlan { get; set; } = "free";
    public DateTime? PlatformPlanExpiresAt { get; set; }

    // Navegação
    public CreatorPlan? CreatorPlan { get; set; }
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<ExclusiveContent> ExclusiveContents { get; set; } = new List<ExclusiveContent>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
    public ICollection<Follow> Following { get; set; } = new List<Follow>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
