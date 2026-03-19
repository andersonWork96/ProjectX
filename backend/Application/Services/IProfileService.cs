using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IProfileService
{
    Task<UserProfileResponse?> GetProfileAsync(int userId, int currentUserId);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<bool> UpdateAvatarAsync(int userId, string avatarUrl);
    Task<bool> UpdateBannerAsync(int userId, string bannerUrl);
    Task<bool> SetCreatorPlansAsync(int creatorId, SetCreatorPlansRequest request);
    Task<List<ExclusiveContentResponse>> GetExclusiveContentAsync(int creatorId, int currentUserId);
}
