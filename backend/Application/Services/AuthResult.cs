using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public enum AuthResultStatus
{
    Ok,
    BadRequest,
    Conflict,
    Unauthorized
}

public class AuthResult
{
    public AuthResultStatus Status { get; }
    public string? Message { get; }
    public AuthResponse? Data { get; }

    private AuthResult(AuthResultStatus status, string? message = null, AuthResponse? data = null)
    {
        Status = status;
        Message = message;
        Data = data;
    }

    public static AuthResult Ok(AuthResponse data) => new(AuthResultStatus.Ok, data: data);
    public static AuthResult Success(string message) => new(AuthResultStatus.Ok, message: message);
    public static AuthResult BadRequest(string message) => new(AuthResultStatus.BadRequest, message);
    public static AuthResult Conflict(string message) => new(AuthResultStatus.Conflict, message);
    public static AuthResult Unauthorized(string message) => new(AuthResultStatus.Unauthorized, message);
}
