using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;
using ProjectX.Domain.Entities;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Infrastructure.Services;

public class InteractionService : IInteractionService
{
    private readonly AppDbContext _db;

    public InteractionService(AppDbContext db)
    {
        _db = db;
    }

    private async Task<bool> IsGhost(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user?.Permission == 1;
    }

    public async Task<bool> ToggleLikeAsync(int userId, int postId)
    {
        var existing = await _db.Likes.FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == postId);
        if (existing is not null)
        {
            _db.Likes.Remove(existing);
            await _db.SaveChangesAsync();
            return false;
        }

        _db.Likes.Add(new Like { UserId = userId, PostId = postId, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        if (!await IsGhost(userId))
        {
            var post = await _db.Posts.FindAsync(postId);
            if (post is not null && post.UserId != userId)
            {
                var user = await _db.Users.FindAsync(userId);
                _db.Notifications.Add(new Notification
                {
                    UserId = post.UserId, Type = "like", ReferenceId = postId,
                    MessageText = $"{user!.Name} curtiu sua publicação.", CreatedAt = DateTime.UtcNow
                });
                await _db.SaveChangesAsync();
            }
        }
        return true;
    }

    public async Task<CommentResponse?> AddCommentAsync(int userId, int postId, string text)
    {
        var post = await _db.Posts.FindAsync(postId);
        if (post is null) return null;

        var comment = new Comment { UserId = userId, PostId = postId, Text = text, CreatedAt = DateTime.UtcNow };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);

        // Badge de assinante (se estiver comentando no post de um criador que ele assina)
        string? badge = null;
        var sub = await _db.Subscriptions.FirstOrDefaultAsync(s =>
            s.SubscriberId == userId && s.CreatorId == post.UserId &&
            s.PaymentStatus == "active" && (s.EndDate == null || s.EndDate > DateTime.UtcNow));
        if (sub is not null) badge = sub.PlanType == "vip" ? "gold" : "bronze";

        if (post.UserId != userId && !await IsGhost(userId))
        {
            _db.Notifications.Add(new Notification
            {
                UserId = post.UserId, Type = "comment", ReferenceId = postId,
                MessageText = $"{user!.Name} comentou na sua publicação.", CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        return new CommentResponse(comment.Id, userId, user!.Name, user.AvatarUrl, user.PlatformPlan, badge, text, comment.CreatedAt);
    }

    public async Task<List<CommentResponse>> GetCommentsAsync(int postId, int page, int pageSize)
    {
        var post = await _db.Posts.FindAsync(postId);
        var comments = await _db.Comments
            .Include(c => c.User)
            .Where(c => c.PostId == postId)
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<CommentResponse>();
        foreach (var c in comments)
        {
            string? badge = null;
            if (post is not null)
            {
                var sub = await _db.Subscriptions.FirstOrDefaultAsync(s =>
                    s.SubscriberId == c.UserId && s.CreatorId == post.UserId &&
                    s.PaymentStatus == "active" && (s.EndDate == null || s.EndDate > DateTime.UtcNow));
                if (sub is not null) badge = sub.PlanType == "vip" ? "gold" : "bronze";
            }
            result.Add(new CommentResponse(c.Id, c.UserId, c.User.Name, c.User.AvatarUrl, c.User.PlatformPlan, badge, c.Text, c.CreatedAt));
        }
        return result;
    }

    public async Task<bool> DeleteCommentAsync(int commentId, int userId)
    {
        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.UserId == userId);
        if (comment is null) return false;
        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleFollowAsync(int followerId, int followingId)
    {
        if (followerId == followingId) return false;

        var existing = await _db.Follows.FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        if (existing is not null)
        {
            _db.Follows.Remove(existing);
            await _db.SaveChangesAsync();
            return false;
        }

        _db.Follows.Add(new Follow { FollowerId = followerId, FollowingId = followingId, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();

        if (!await IsGhost(followerId))
        {
            var user = await _db.Users.FindAsync(followerId);
            _db.Notifications.Add(new Notification
            {
                UserId = followingId, Type = "follow", ReferenceId = followerId,
                MessageText = $"{user!.Name} começou a seguir você.", CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }
        return true;
    }

    public async Task<List<NotificationResponse>> GetNotificationsAsync(int userId, int page, int pageSize)
    {
        return await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationResponse(n.Id, n.Type, n.MessageText, n.ReferenceId, n.Read, n.CreatedAt))
            .ToListAsync();
    }

    public async Task MarkNotificationsReadAsync(int userId)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.Read)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.Read, true));
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _db.Notifications.CountAsync(n => n.UserId == userId && !n.Read);
    }
}
