namespace ProjectX.Domain.Entities;

public class CreatorPlan
{
    public int Id { get; set; }
    public int CreatorId { get; set; }
    public decimal FanPrice { get; set; }
    public decimal VipPrice { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Creator { get; set; } = null!;
}
