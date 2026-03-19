namespace ProjectX.Domain.Entities;

public class SiteVisit
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? IpAddress { get; set; }
    public DateTime VisitedAt { get; set; } = DateTime.UtcNow;
}
