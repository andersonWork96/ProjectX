namespace ProjectX.Application.Contracts;

public record RegisterRequest(string Name, string Username, string Email, string Password, bool IsCreator = false);
public record LoginRequest(string Email, string Password);
public record ChangePasswordRequest(string Email, string CurrentPassword, string NewPassword);
public record LocationRequest(double Latitude, double Longitude);
public record AuthResponse(int Id, string Name, string Username, string Email, bool IsCreator, int Permission, string PlatformPlan, bool HasLocation, string Token);
