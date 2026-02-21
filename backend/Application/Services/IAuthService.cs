using ProjectX.Application.Contracts;

namespace ProjectX.Application.Services;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest request);
    Task<AuthResult> LoginAsync(LoginRequest request);
}
