namespace ProjectX.Application.Contracts;

public record RegisterRequest(string Name, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(int Id, string Name, string Email, int Permission, string Token);
