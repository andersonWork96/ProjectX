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
            .Include(u => u.CreatorPlan)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null) return null;

        var followersCount = await _db.Follows.CountAsync(f => f.FollowingId == userId);
        var followingCount = await _db.Follows.CountAsync(f => f.FollowerId == userId);
        var postsCount = await _db.Posts.CountAsync(p => p.UserId == userId);
        var exclusiveCount = await _db.ExclusiveContents.CountAsync(e => e.CreatorId == userId);
        var subscribersCount = await _db.Subscriptions.CountAsync(s => s.CreatorId == userId && s.PaymentStatus == "active" && (s.EndDate == null || s.EndDate > DateTime.UtcNow));
        var isFollowed = currentUserId > 0 && await _db.Follows.AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);

        // Verificar assinatura do usuário atual neste criador
        string? mySubscriptionPlan = null;
        if (currentUserId > 0)
        {
            var sub = await _db.Subscriptions.FirstOrDefaultAsync(s =>
                s.SubscriberId == currentUserId && s.CreatorId == userId &&
                s.PaymentStatus == "active" && (s.EndDate == null || s.EndDate > DateTime.UtcNow));
            mySubscriptionPlan = sub?.PlanType;
        }

        CreatorPlanResponse? creatorPlan = null;
        if (user.IsCreator && user.CreatorPlan is not null)
        {
            creatorPlan = new CreatorPlanResponse(user.CreatorPlan.FanPrice, user.CreatorPlan.VipPrice);
        }

        return new UserProfileResponse(
            user.Id, user.Name, user.AvatarUrl, user.BannerUrl,
            user.Bio, user.City, user.Gender,
            user.IsCreator, user.PlatformPlan,
            followersCount, followingCount, postsCount, exclusiveCount, subscribersCount,
            isFollowed, mySubscriptionPlan, creatorPlan
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

    public async Task<bool> UpdateBannerAsync(int userId, string bannerUrl)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null) return false;
        user.BannerUrl = bannerUrl;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> SetCreatorPlansAsync(int creatorId, SetCreatorPlansRequest request)
    {
        var user = await _db.Users.FindAsync(creatorId);
        if (user is null || !user.IsCreator) return false;

        var plan = await _db.CreatorPlans.FirstOrDefaultAsync(p => p.CreatorId == creatorId);
        if (plan is null)
        {
            plan = new CreatorPlan { CreatorId = creatorId };
            _db.CreatorPlans.Add(plan);
        }

        plan.FanPrice = request.FanPrice;
        plan.VipPrice = request.VipPrice;
        plan.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<ExclusiveContentResponse>> GetExclusiveContentAsync(int creatorId, int currentUserId)
    {
        // Verificar assinatura
        string? userPlan = null;
        if (currentUserId > 0)
        {
            var sub = await _db.Subscriptions.FirstOrDefaultAsync(s =>
                s.SubscriberId == currentUserId && s.CreatorId == creatorId &&
                s.PaymentStatus == "active" && (s.EndDate == null || s.EndDate > DateTime.UtcNow));
            userPlan = sub?.PlanType;
        }

        // Admin (permissão 1) ou próprio criador vê tudo
        var currentUser = currentUserId > 0 ? await _db.Users.FindAsync(currentUserId) : null;
        bool isAdmin = currentUser?.Permission == 1;
        bool isOwner = currentUserId == creatorId;

        var contents = await _db.ExclusiveContents
            .Where(e => e.CreatorId == creatorId)
            .OrderBy(e => e.DisplayOrder)
            .ThenByDescending(e => e.CreatedAt)
            .ToListAsync();

        return contents.Select(c =>
        {
            bool canView = isAdmin || isOwner || userPlan == "vip" || (userPlan == "fan" && c.MinPlan == "fan");
            return new ExclusiveContentResponse(
                c.Id, c.Caption, c.MediaType,
                c.MediaUrl, // Sempre envia (frontend aplica blur se locked)
                !canView,
                c.MinPlan, c.CreatedAt
            );
        }).ToList();
    }
}
