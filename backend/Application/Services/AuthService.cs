using ProjectX.Application.Abstractions;
using ProjectX.Application.Contracts;
using ProjectX.Domain.Entities;

namespace ProjectX.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokens;

    public AuthService(IUserRepository users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthResult.BadRequest("Nome, email e senha sao obrigatorios.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _users.EmailExistsAsync(email);
        if (exists)
        {
            return AuthResult.Conflict("Email ja cadastrado.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        var token = _tokens.Generate(user);
        return AuthResult.Ok(new AuthResponse(user.Id, user.Name, user.Email, user.Permission, token));
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthResult.BadRequest("Email e senha sao obrigatorios.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return AuthResult.Unauthorized("Credenciais invalidas.");
        }

        var token = _tokens.Generate(user);
        return AuthResult.Ok(new AuthResponse(user.Id, user.Name, user.Email, user.Permission, token));
    }
}
