namespace ProjectX.Application.Contracts;

public record CreatePostRequest(string? Caption);

public record PostResponse(
    int Id,
    int UserId,
    string UserName,
    string? UserAvatarUrl,
    string? Caption,
    List<string> Images,
    int LikesCount,
    int CommentsCount,
    bool LikedByMe,
    DateTime CreatedAt
);

public record FeedRequest(int Page, int PageSize);

public record PagedResponse<T>(List<T> Items, int Page, int PageSize, int TotalCount, bool HasMore);
