namespace ProjectX.Domain.Entities;

public class Subscription
{
    public int Id { get; set; }
    public int SubscriberId { get; set; }
    public int CreatorId { get; set; }
    public string PlanType { get; set; } = "fan"; // fan, vip
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public string PaymentStatus { get; set; } = "active"; // active, cancelled, expired

    public User Subscriber { get; set; } = null!;
    public User Creator { get; set; } = null!;
}
