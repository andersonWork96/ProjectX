namespace ProjectX.Domain.Entities;

public class ExclusiveContent
{
    public int Id { get; set; }
    public int CreatorId { get; set; }
    public string? Caption { get; set; }
    public string MediaType { get; set; } = "image"; // image, video
    public string MediaUrl { get; set; } = string.Empty;
    public string MinPlan { get; set; } = "fan"; // fan, vip
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Creator { get; set; } = null!;
}
