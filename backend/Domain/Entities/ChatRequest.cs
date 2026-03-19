namespace ProjectX.Domain.Entities;

public class ChatRequest
{
    public int Id { get; set; }
    public int FromUserId { get; set; }
    public int ToCreatorId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, accepted, rejected
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }

    public User FromUser { get; set; } = null!;
    public User ToCreator { get; set; } = null!;
}
