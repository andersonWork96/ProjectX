namespace ProjectX.Application.Contracts;

public record CreatePostRequest(string? Caption);

public record PostResponse(
    int Id,
    int UserId,
    string UserName,
    string? UserAvatarUrl,
    bool UserIsCreator,
    bool UserIsOnline,
    string? Caption,
    List<string> Images,
    int LikesCount,
    int CommentsCount,
    bool LikedByMe,
    bool IsCensored,
    DateTime CreatedAt
);

public record FeedRequest(int Page, int PageSize);

public record PagedResponse<T>(List<T> Items, int Page, int PageSize, int TotalCount, bool HasMore);

public record TrendingCreatorResponse(
    int Id,
    string Name,
    string? AvatarUrl,
    bool IsOnline,
    int SubscribersCount,
    int NewSubscribersWeek
);

