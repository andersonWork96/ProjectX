using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Contracts;
using ProjectX.Application.Services;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return result.Status switch
        {
            AuthResultStatus.BadRequest => BadRequest(result.Message),
            AuthResultStatus.Conflict => Conflict(result.Message),
            _ => Ok(result.Data)
        };
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return result.Status switch
        {
            AuthResultStatus.BadRequest => BadRequest(result.Message),
            AuthResultStatus.Unauthorized => Unauthorized(result.Message),
            _ => Ok(result.Data)
        };
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<object>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var result = await _authService.ChangePasswordAsync(request);
        return result.Status switch
        {
            AuthResultStatus.BadRequest => BadRequest(result.Message),
            AuthResultStatus.Unauthorized => Unauthorized(result.Message),
            _ => Ok(new { message = result.Message })
        };
    }

    [HttpGet("check-username/{username}")]
    public async Task<IActionResult> CheckUsername(string username)
    {
        var exists = await _authService.UsernameExistsAsync(username.Trim().ToLowerInvariant());
        return Ok(new { available = !exists });
    }

    [Authorize]
    [HttpPost("location")]
    public async Task<IActionResult> UpdateLocation(
        [FromBody] LocationRequest request,
        [FromServices] ProjectX.Infrastructure.Data.AppDbContext db)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");
        var user = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        // Arredondar para 2 casas decimais (~1km precisão = nível bairro, nunca rua/casa)
        user.Latitude = Math.Round(request.Latitude, 2);
        user.Longitude = Math.Round(request.Longitude, 2);
        user.LastLocationAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new { message = "Localização atualizada." });
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var name = User.FindFirstValue(ClaimTypes.Name);
        var isCreator = User.FindFirstValue("isCreator");
        var platformPlan = User.FindFirstValue("platformPlan");

        return Ok(new { id = userId, name, email, isCreator, platformPlan });
    }
}
