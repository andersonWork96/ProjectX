using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email");
        var name = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("unique_name");
        var permission = User.FindFirstValue("permissao");

        return Ok(new
        {
            id = userId,
            name,
            email,
            permission
        });
    }
}
