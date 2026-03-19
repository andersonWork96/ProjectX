using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectX.Domain.Entities;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    private async Task<bool> IsAdmin()
    {
        var user = await _db.Users.FindAsync(GetUserId());
        return user?.Permission == 1;
    }

    // Registrar visita (chamado pelo frontend ao carregar o feed)
    [HttpPost("visit")]
    public async Task<IActionResult> RegisterVisit()
    {
        var userId = GetUserId();

        // Atualizar lastSeen para usuários logados
        if (userId > 0)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user is not null)
            {
                user.LastSeenAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                if (user.Permission == 1) return Ok(); // Admin fantasma
            }
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        _db.SiteVisits.Add(new SiteVisit
        {
            UserId = userId > 0 ? userId : null,
            IpAddress = ip,
            VisitedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return Ok();
    }

    // Stats do dia (apenas admin)
    [Authorize]
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!await IsAdmin()) return Forbid();

        var today = DateTime.UtcNow.Date;
        // Visitas sem conta (userId é null = visitante anônimo)
        var anonymousVisitsToday = await _db.SiteVisits.CountAsync(v => v.VisitedAt >= today && v.UserId == null);
        // Assinantes ativos de criadores
        var creatorSubscribers = await _db.Subscriptions.CountAsync(s =>
            s.PaymentStatus == "active" && (s.EndDate == null || s.EndDate > DateTime.UtcNow));
        var totalUsers = await _db.Users.CountAsync();
        var totalCreators = await _db.Users.CountAsync(u => u.IsCreator);
        var totalPosts = await _db.Posts.CountAsync();
        var newUsersToday = await _db.Users.CountAsync(u => u.CreatedAt >= today);

        return Ok(new
        {
            anonymousVisitsToday,
            creatorSubscribers,
            totalUsers,
            totalCreators,
            totalPosts,
            newUsersToday
        });
    }

    // Deletar post de qualquer pessoa (admin)
    [Authorize]
    [HttpDelete("posts/{postId}")]
    public async Task<IActionResult> DeletePost(int postId)
    {
        if (!await IsAdmin()) return Forbid();

        var post = await _db.Posts.FindAsync(postId);
        if (post is null) return NotFound();

        // Notificar o dono
        _db.Notifications.Add(new Notification
        {
            UserId = post.UserId,
            Type = "content_removed",
            ReferenceId = postId,
            MessageText = "Sua publicação foi removida por violar as diretrizes da comunidade.",
            CreatedAt = DateTime.UtcNow
        });

        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Post removido e usuário notificado." });
    }

    // Deletar conteúdo exclusivo de qualquer pessoa (admin)
    [Authorize]
    [HttpDelete("exclusive/{contentId}")]
    public async Task<IActionResult> DeleteExclusiveContent(int contentId)
    {
        if (!await IsAdmin()) return Forbid();

        var content = await _db.ExclusiveContents.FindAsync(contentId);
        if (content is null) return NotFound();

        _db.Notifications.Add(new Notification
        {
            UserId = content.CreatorId,
            Type = "content_removed",
            ReferenceId = contentId,
            MessageText = "Seu conteúdo exclusivo foi removido por violar as diretrizes da comunidade.",
            CreatedAt = DateTime.UtcNow
        });

        _db.ExclusiveContents.Remove(content);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Conteúdo removido e criador notificado." });
    }

    // Listar todos os usuários (admin)
    [Authorize]
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        if (!await IsAdmin()) return Forbid();

        var users = await _db.Users
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new
            {
                u.Id, u.Name, u.Username, u.Email, u.IsCreator,
                u.Permission, u.PlatformPlan, u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    // Mapa de usuários com localização (admin)
    [Authorize]
    [HttpGet("users-map")]
    public async Task<IActionResult> GetUsersMap([FromQuery] string? filter)
    {
        if (!await IsAdmin()) return Forbid();

        var query = _db.Users
            .Where(u => u.Latitude != null && u.Longitude != null && u.Permission != 1);

        if (filter == "creators")
            query = query.Where(u => u.IsCreator);
        else if (filter == "today")
            query = query.Where(u => u.LastLocationAt >= DateTime.UtcNow.Date);

        var users = await query
            .Select(u => new
            {
                u.Id, u.Name, u.Username, u.IsCreator, u.City,
                u.Latitude, u.Longitude, u.LastLocationAt
            })
            .ToListAsync();

        return Ok(users);
    }
}
