using ProjectX.Domain.Entities;

namespace ProjectX.Application.Abstractions;

public interface IUserRepository
{
    Task<bool> EmailExistsAsync(string email);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
    Task SaveChangesAsync();
}
