/*
 *       @Author: yaile
 */

using Currenter.Api.Data;
using Currenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Currenter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    // DTO
    public record UserDto(int Id, string Name, string Email, string Role);
    public record UpdateAccessDto(string CurrencyCode);

    /// Получает список всех пользователей
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new UserDto(u.Id, u.Name, u.Email, u.Role))
            .ToListAsync();

        return Ok(users);
    }

    /// Получает список валют, доступных конкретному пользователю
    [HttpGet("users/{userId}/currencies")]
    public async Task<IActionResult> GetUserCurrencies(int userId)
    {
        var accessibleCurrencies = await _context.UserCurrencyAccesses
            .Where(uca => uca.UserId == userId)
            .Select(uca => uca.CurrencyCode)
            .ToListAsync();

        return Ok(accessibleCurrencies);
    }

    /// Предоставляет пользователю доступ к валюте
    [HttpPost("users/{userId}/currencies")]
    public async Task<IActionResult> GrantCurrencyAccess(int userId, [FromBody] UpdateAccessDto dto)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists) return NotFound("User not found.");

        var currencyExists = await _context.Currencies.AnyAsync(c => c.CurrencyCode == dto.CurrencyCode);
        if (!currencyExists) return NotFound("Currency not found.");

        var accessExists = await _context.UserCurrencyAccesses
            .AnyAsync(uca => uca.UserId == userId && uca.CurrencyCode == dto.CurrencyCode);

        if (accessExists)
        {
            return Ok("Access already granted.");
        }

        var newAccess = new UserCurrencyAccess { UserId = userId, CurrencyCode = dto.CurrencyCode };
        _context.UserCurrencyAccesses.Add(newAccess);
        await _context.SaveChangesAsync();

        return Ok("Access granted successfully.");
    }

    /// Отзывает у пользователя доступ к валюте
    [HttpDelete("users/{userId}/currencies/{currencyCode}")]
    public async Task<IActionResult> RevokeCurrencyAccess(int userId, string currencyCode)
    {
        var accessEntry = await _context.UserCurrencyAccesses
            .FirstOrDefaultAsync(uca => uca.UserId == userId && uca.CurrencyCode == currencyCode);

        if (accessEntry == null)
        {
            return NotFound("Access entry not found.");
        }

        _context.UserCurrencyAccesses.Remove(accessEntry);
        await _context.SaveChangesAsync();

        return Ok("Access revoked successfully.");
    }
    
    /// Получает список всех существующих валют
    [HttpGet("currencies")]
    public async Task<IActionResult> GetAllCurrencies()
    {
        var allCurrencies = await _context.Currencies
            .AsNoTracking()
            .OrderBy(c => c.CurrencyCode)
            .ToListAsync();

        return Ok(allCurrencies);
    }
}