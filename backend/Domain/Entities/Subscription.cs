namespace ProjectX.Domain.Entities;

public class Subscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Plan { get; set; } = "free"; // free, premium, master
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public string PaymentStatus { get; set; } = "pending"; // pending, active, cancelled, expired

    public User User { get; set; } = null!;
}
