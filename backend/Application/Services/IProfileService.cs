using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IProfileService
{
    Task<UserProfileResponse?> GetProfileAsync(int userId, int currentUserId);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<bool> UpdateAvatarAsync(int userId, string avatarUrl);
    Task<bool> UpdateCompanionProfileAsync(int userId, CompanionProfileRequest request);
}
