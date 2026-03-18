using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;
using ProjectX.Domain.Entities;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Infrastructure.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _db;

    public ProfileService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserProfileResponse?> GetProfileAsync(int userId, int currentUserId)
    {
        var user = await _db.Users
            .Include(u => u.CompanionProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null) return null;

        var followersCount = await _db.Follows.CountAsync(f => f.FollowingId == userId);
        var followingCount = await _db.Follows.CountAsync(f => f.FollowerId == userId);
        var postsCount = await _db.Posts.CountAsync(p => p.UserId == userId);
        var isFollowed = currentUserId > 0 && await _db.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);
        var isInterested = currentUserId > 0 && await _db.Interests.AnyAsync(i => i.FromUserId == currentUserId && i.ToUserId == userId);

        CompanionProfileResponse? companionProfile = null;
        if (user.CompanionProfile is not null)
        {
            var cp = user.CompanionProfile;
            companionProfile = new CompanionProfileResponse(
                cp.PriceRange, cp.Verified, cp.Rating, cp.RatingCount, cp.AvailableFor
            );
        }

        return new UserProfileResponse(
            user.Id, user.Name, user.Email, user.Type,
            user.AvatarUrl, user.Bio, user.City, user.Gender,
            user.BirthDate, user.Plan,
            followersCount, followingCount, postsCount,
            isFollowed, isInterested, companionProfile
        );
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return false;

        if (request.Name is not null) user.Name = request.Name;
        if (request.Bio is not null) user.Bio = request.Bio;
        if (request.City is not null) user.City = request.City;
        if (request.Gender is not null) user.Gender = request.Gender;
        if (request.BirthDate.HasValue) user.BirthDate = request.BirthDate;
        if (request.Phone is not null) user.Phone = request.Phone;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateAvatarAsync(int userId, string avatarUrl)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return false;

        user.AvatarUrl = avatarUrl;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateCompanionProfileAsync(int userId, CompanionProfileRequest request)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null || user.Type != "companion") return false;

        var profile = await _db.CompanionProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile is null)
        {
            profile = new CompanionProfile { UserId = userId };
            _db.CompanionProfiles.Add(profile);
        }

        if (request.PriceRange is not null) profile.PriceRange = request.PriceRange;
        if (request.AvailableFor is not null) profile.AvailableFor = request.AvailableFor;

        await _db.SaveChangesAsync();
        return true;
    }
}
