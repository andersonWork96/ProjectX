namespace ProjectX.Application.Contracts;

public record UpdateProfileRequest(
    string? Name,
    string? Bio,
    string? City,
    string? Gender,
    DateTime? BirthDate,
    string? Phone
);

public record CompanionProfileRequest(
    string? PriceRange,
    string? AvailableFor
);

public record UserProfileResponse(
    int Id,
    string Name,
    string Email,
    string Type,
    string? AvatarUrl,
    string? Bio,
    string? City,
    string? Gender,
    DateTime? BirthDate,
    string Plan,
    int FollowersCount,
    int FollowingCount,
    int PostsCount,
    bool IsFollowedByMe,
    bool IsInterestedByMe,
    CompanionProfileResponse? CompanionProfile
);

public record CompanionProfileResponse(
    string? PriceRange,
    bool Verified,
    double Rating,
    int RatingCount,
    string? AvailableFor
);
