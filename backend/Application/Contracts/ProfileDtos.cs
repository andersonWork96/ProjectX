namespace ProjectX.Application.Contracts;

public record UpdateProfileRequest(
    string? Name,
    string? Bio,
    string? City,
    string? Gender,
    DateTime? BirthDate,
    string? Phone
);

public record SetCreatorPlansRequest(
    decimal FanPrice,
    decimal VipPrice
);

public record UserProfileResponse(
    int Id,
    string Name,
    string? AvatarUrl,
    string? BannerUrl,
    string? Bio,
    string? City,
    string? Gender,
    bool IsCreator,
    string PlatformPlan,
    int FollowersCount,
    int FollowingCount,
    int PostsCount,
    int ExclusiveCount,
    int SubscribersCount,
    bool IsFollowedByMe,
    string? MySubscriptionPlan,
    CreatorPlanResponse? CreatorPlan
);

public record CreatorPlanResponse(
    decimal FanPrice,
    decimal VipPrice
);

public record ExclusiveContentResponse(
    int Id,
    string? Caption,
    string MediaType,
    string? MediaUrl,
    bool IsLocked,
    string MinPlan,
    DateTime CreatedAt
);
