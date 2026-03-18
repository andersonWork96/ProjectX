namespace ProjectX.Application.Contracts;

public record RegisterRequest(string Name, string Email, string Password, string Type = "client");
public record LoginRequest(string Email, string Password);
public record ChangePasswordRequest(string Email, string CurrentPassword, string NewPassword);
public record AuthResponse(int Id, string Name, string Email, int Permission, string Token);
