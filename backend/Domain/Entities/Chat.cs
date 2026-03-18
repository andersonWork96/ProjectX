namespace ProjectX.Domain.Entities;

public class Chat
{
    public int Id { get; set; }
    public int User1Id { get; set; }
    public int User2Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastMessageAt { get; set; }

    public User User1 { get; set; } = null!;
    public User User2 { get; set; } = null!;
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}
