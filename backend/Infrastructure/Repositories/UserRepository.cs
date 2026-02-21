using Microsoft.EntityFrameworkCore;
using ProjectX.Application.Abstractions;
using ProjectX.Domain.Entities;
using ProjectX.Infrastructure.Data;

namespace ProjectX.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<bool> EmailExistsAsync(string email)
        => _db.Users.AnyAsync(u => u.Email == email);

    public Task<User?> GetByEmailAsync(string email)
        => _db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task AddAsync(User user)
    {
        await _db.Users.AddAsync(user);
    }

    public Task SaveChangesAsync()
        => _db.SaveChangesAsync();
}
