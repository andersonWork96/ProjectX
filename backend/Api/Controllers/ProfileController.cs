using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;
using ProjectX.Infrastructure.Helpers;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile(int userId)
    {
        var currentUserId = GetUserId();
        var profile = await _profileService.GetProfileAsync(userId, currentUserId);
        return profile is not null ? Ok(profile) : NotFound();
    }

    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var updated = await _profileService.UpdateProfileAsync(GetUserId(), request);
        return updated ? Ok(new { message = "Perfil atualizado." }) : NotFound();
    }

    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UpdateAvatar([FromForm] IFormFile avatar)
    {
        var dataUri = await ImageHelper.ToBase64DataUri(avatar);
        var updated = await _profileService.UpdateAvatarAsync(GetUserId(), dataUri);
        return updated ? Ok(new { avatarUrl = dataUri }) : NotFound();
    }

    [Authorize]
    [HttpPost("banner")]
    public async Task<IActionResult> UpdateBanner([FromForm] IFormFile banner)
    {
        var dataUri = await ImageHelper.ToBase64DataUri(banner);
        var updated = await _profileService.UpdateBannerAsync(GetUserId(), dataUri);
        return updated ? Ok(new { bannerUrl = dataUri }) : NotFound();
    }

    [Authorize]
    [HttpPut("creator-plans")]
    public async Task<IActionResult> SetCreatorPlans([FromBody] SetCreatorPlansRequest request)
    {
        var updated = await _profileService.SetCreatorPlansAsync(GetUserId(), request);
        return updated ? Ok(new { message = "Planos atualizados." }) : BadRequest("Usuário não é criador.");
    }

    [HttpGet("{creatorId}/exclusive")]
    public async Task<ActionResult<List<ExclusiveContentResponse>>> GetExclusiveContent(int creatorId)
    {
        var currentUserId = GetUserId();
        var content = await _profileService.GetExclusiveContentAsync(creatorId, currentUserId);
        return Ok(content);
    }

    [Authorize]
    [HttpPost("exclusive")]
    public async Task<IActionResult> AddExclusiveContent(
        [FromForm] string? caption,
        [FromForm] string mediaType,
        [FromForm] string minPlan,
        [FromForm] IFormFile media)
    {
        var dataUri = await ImageHelper.ToBase64DataUri(media);

        var userId = GetUserId();
        using var scope = HttpContext.RequestServices.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ProjectX.Infrastructure.Data.AppDbContext>();
        var user = await db.Users.FindAsync(userId);
        if (user is null || !user.IsCreator) return BadRequest("Não é criador.");

        db.ExclusiveContents.Add(new ProjectX.Domain.Entities.ExclusiveContent
        {
            CreatorId = userId,
            Caption = caption,
            MediaType = mediaType ?? "image",
            MediaUrl = dataUri,
            MinPlan = minPlan ?? "fan",
            CreatedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
        return Ok(new { message = "Conteúdo publicado." });
    }

    [Authorize]
    [HttpPut("exclusive/reorder")]
    public async Task<IActionResult> ReorderExclusiveContent(
        [FromBody] List<int> orderedIds,
        [FromServices] ProjectX.Infrastructure.Data.AppDbContext db)
    {
        var userId = GetUserId();
        var contents = await db.ExclusiveContents
            .Where(e => e.CreatorId == userId)
            .ToListAsync();

        for (int i = 0; i < orderedIds.Count; i++)
        {
            var item = contents.FirstOrDefault(c => c.Id == orderedIds[i]);
            if (item is not null) item.DisplayOrder = i;
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Ordem atualizada." });
    }
}
