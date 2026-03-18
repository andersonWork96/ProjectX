namespace ProjectX.Domain.Entities;

public class Post
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Caption { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<PostImage> Images { get; set; } = new List<PostImage>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
