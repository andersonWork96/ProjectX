namespace ProjectX.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int Permission { get; set; } = 3;

    // Novos campos
    public string Type { get; set; } = "client"; // client, companion, admin
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? City { get; set; }
    public string? Gender { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Phone { get; set; }
    public string Plan { get; set; } = "free"; // free, premium, master
    public DateTime? PlanExpiresAt { get; set; }

    // Navegação
    public CompanionProfile? CompanionProfile { get; set; }
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
    public ICollection<Follow> Following { get; set; } = new List<Follow>();
    public ICollection<Interest> InterestsReceived { get; set; } = new List<Interest>();
    public ICollection<Interest> InterestsSent { get; set; } = new List<Interest>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
