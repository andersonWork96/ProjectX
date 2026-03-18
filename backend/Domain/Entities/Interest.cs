namespace ProjectX.Domain.Entities;

public class Interest
{
    public int Id { get; set; }
    public int FromUserId { get; set; }
    public int ToUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User FromUser { get; set; } = null!;
    public User ToUser { get; set; } = null!;
}
