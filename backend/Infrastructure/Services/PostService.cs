using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;
using ProjectX.Domain.Entities;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Infrastructure.Services;

public class PostService : IPostService
{
    private readonly AppDbContext _db;

    public PostService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PostResponse> CreateAsync(int userId, string? caption, List<string> imageUrls)
    {
        var post = new Post
        {
            UserId = userId,
            Caption = caption,
            CreatedAt = DateTime.UtcNow
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();

        for (int i = 0; i < imageUrls.Count; i++)
        {
            _db.PostImages.Add(new PostImage
            {
                PostId = post.Id,
                ImageUrl = imageUrls[i],
                Order = i
            });
        }
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        return new PostResponse(
            post.Id, userId, user!.Name, user.AvatarUrl,
            caption, imageUrls, 0, 0, false, post.CreatedAt
        );
    }

    public async Task<bool> DeleteAsync(int postId, int userId)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.UserId == userId);
        if (post is null) return false;

        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<PostResponse?> GetByIdAsync(int postId, int currentUserId)
    {
        var post = await _db.Posts
            .Include(p => p.User)
            .Include(p => p.Images.OrderBy(i => i.Order))
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post is null) return null;

        return MapToResponse(post, currentUserId);
    }

    public async Task<PagedResponse<PostResponse>> GetFeedAsync(int currentUserId, int page, int pageSize)
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Images.OrderBy(i => i.Order))
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = posts.Select(p => MapToResponse(p, currentUserId)).ToList();
        return new PagedResponse<PostResponse>(items, page, pageSize, totalCount, page * pageSize < totalCount);
    }

    public async Task<PagedResponse<PostResponse>> GetUserPostsAsync(int userId, int currentUserId, int page, int pageSize)
    {
        var query = _db.Posts
            .Include(p => p.User)
            .Include(p => p.Images.OrderBy(i => i.Order))
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = posts.Select(p => MapToResponse(p, currentUserId)).ToList();
        return new PagedResponse<PostResponse>(items, page, pageSize, totalCount, page * pageSize < totalCount);
    }

    private static PostResponse MapToResponse(Post post, int currentUserId)
    {
        return new PostResponse(
            post.Id,
            post.UserId,
            post.User.Name,
            post.User.AvatarUrl,
            post.Caption,
            post.Images.Select(i => i.ImageUrl).ToList(),
            post.Likes.Count,
            post.Comments.Count,
            post.Likes.Any(l => l.UserId == currentUserId),
            post.CreatedAt
        );
    }
}
