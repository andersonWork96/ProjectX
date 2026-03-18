namespace ProjectX.Domain.Entities;

public class PostImage
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public int Order { get; set; }

    public Post Post { get; set; } = null!;
}
