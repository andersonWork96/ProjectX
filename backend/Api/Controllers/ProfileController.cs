using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;

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
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "avatars");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(avatar.FileName)}";
        var filePath = Path.Combine(uploadsDir, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await avatar.CopyToAsync(stream);

        var avatarUrl = $"/avatars/{fileName}";
        var updated = await _profileService.UpdateAvatarAsync(GetUserId(), avatarUrl);
        return updated ? Ok(new { avatarUrl }) : NotFound();
    }

    [Authorize]
    [HttpPut("companion")]
    public async Task<IActionResult> UpdateCompanionProfile([FromBody] CompanionProfileRequest request)
    {
        var updated = await _profileService.UpdateCompanionProfileAsync(GetUserId(), request);
        return updated ? Ok(new { message = "Perfil de acompanhante atualizado." }) : BadRequest("Usuário não é acompanhante.");
    }
}
