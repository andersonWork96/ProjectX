using ProjectX.Domain.Entities;

namespace ProjectX.Application.Abstractions;

public interface ITokenService
{
    string Generate(User user);
}
