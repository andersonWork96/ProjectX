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
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return AuthResult.BadRequest("Nome, nome artístico, email e senha são obrigatórios.");
        }

        var username = request.Username.Trim().ToLowerInvariant();

        // Validar formato do username (só letras, números, pontos e underscores)
        if (!System.Text.RegularExpressions.Regex.IsMatch(username, @"^[a-z0-9._]{3,30}$"))
        {
            return AuthResult.BadRequest("Nome artístico deve ter 3-30 caracteres (letras, números, . e _).");
        }

        var usernameExists = await _users.UsernameExistsAsync(username);
        if (usernameExists)
        {
            return AuthResult.Conflict("Esse nome artístico já está em uso.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var emailExists = await _users.EmailExistsAsync(email);
        if (emailExists)
        {
            return AuthResult.Conflict("Email já cadastrado.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            IsCreator = request.IsCreator
        };

        await _users.AddAsync(user);
        await _users.SaveChangesAsync();

        var token = _tokens.Generate(user);
        return AuthResult.Ok(new AuthResponse(user.Id, user.Name, user.Username, user.Email, user.IsCreator, user.Permission, user.PlatformPlan, user.Latitude.HasValue, token));
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
        return AuthResult.Ok(new AuthResponse(user.Id, user.Name, user.Username, user.Email, user.IsCreator, user.Permission, user.PlatformPlan, user.Latitude.HasValue, token));
    }

    public async Task<AuthResult> ChangePasswordAsync(ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return AuthResult.BadRequest("Email, senha atual e nova senha sao obrigatorios.");
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            return AuthResult.BadRequest("A nova senha deve ser diferente da senha atual.");
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return AuthResult.Unauthorized("Credenciais invalidas.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _users.SaveChangesAsync();

        return AuthResult.Success("Senha alterada com sucesso.");
    }

    public Task<bool> UsernameExistsAsync(string username)
    {
        return _users.UsernameExistsAsync(username);
    }
}
