namespace ProjectX.Domain.Entities;

public class CompanionProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? PriceRange { get; set; }
    public bool Verified { get; set; }
    public double Rating { get; set; }
    public int RatingCount { get; set; }
    public string? AvailableFor { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}
