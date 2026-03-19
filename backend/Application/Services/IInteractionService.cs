using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IInteractionService
{
    Task<bool> ToggleLikeAsync(int userId, int postId);
    Task<CommentResponse?> AddCommentAsync(int userId, int postId, string text);
    Task<List<CommentResponse>> GetCommentsAsync(int postId, int page, int pageSize);
    Task<bool> DeleteCommentAsync(int commentId, int userId);
    Task<bool> ToggleFollowAsync(int followerId, int followingId);
    Task<List<NotificationResponse>> GetNotificationsAsync(int userId, int page, int pageSize);
    Task MarkNotificationsReadAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
}
