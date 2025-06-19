using Currenter.Api.Entities;

namespace Currenter.Api.Services;

public interface IJwtService
{
    string GenerateToken(User user);
}