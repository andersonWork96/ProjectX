using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("api/feed")]
public class FeedController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeedController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("trending-creators")]
    public async Task<ActionResult<List<TrendingCreatorResponse>>> GetTrendingCreators()
    {
        var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

        var creators = await _db.Users
            .Where(u => u.IsCreator && u.Permission != 1)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.AvatarUrl,
                u.LastSeenAt,
                SubscribersCount = _db.Subscriptions.Count(s => s.CreatorId == u.Id && s.EndDate > DateTime.UtcNow),
                NewSubscribersWeek = _db.Subscriptions.Count(s => s.CreatorId == u.Id && s.StartDate >= oneWeekAgo)
            })
            .OrderByDescending(u => u.NewSubscribersWeek)
            .ThenByDescending(u => u.SubscribersCount)
            .Take(10)
            .ToListAsync();

        var result = creators.Select(c => new TrendingCreatorResponse(
            c.Id,
            c.Name,
            c.AvatarUrl,
            c.LastSeenAt.HasValue && (DateTime.UtcNow - c.LastSeenAt.Value).TotalMinutes < 5,
            c.SubscribersCount,
            c.NewSubscribersWeek
        )).ToList();

        return Ok(result);
    }

}
