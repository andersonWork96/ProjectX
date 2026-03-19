using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IPostService
{
    Task<PostResponse> CreateAsync(int userId, string? caption, List<string> imageUrls, bool isCensored = false);
    Task<bool> DeleteAsync(int postId, int userId);
    Task<PostResponse?> GetByIdAsync(int postId, int currentUserId);
    Task<PagedResponse<PostResponse>> GetFeedAsync(int currentUserId, int page, int pageSize);
    Task<PagedResponse<PostResponse>> GetUserPostsAsync(int userId, int currentUserId, int page, int pageSize);
}
