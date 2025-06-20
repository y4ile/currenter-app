/*
 *       @Author: yaile
 */

using System.Security.Claims;
using System.Text.Json;
using Currenter.Api.Data;
using Currenter.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Currenter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CurrenciesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IDistributedCache _cache;

    // Внедряем DbContext через конструктор
    public CurrenciesController(ApplicationDbContext context, IDistributedCache cache)
    {
        _context = context;
        _cache = cache;
    }
    
    // [GET] /api/currencies
    [HttpGet]
    public async Task<IActionResult> GetCurrencies()
    {
        // Получаем ID текущего пользователя из его токена
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized();
        }
        
        // Ключ кэша теперь должен быть уникальным для каждого пользователя
        var cacheKey = $"currencies_{userId}";
        List<Currency> currencies;
        
        var cachedCurrencies = await _cache.GetStringAsync(cacheKey);
        
        if (cachedCurrencies != null)
        {
            // Данные найдены в кэше. Десериализуем их в List<Currency>.
            currencies = JsonSerializer.Deserialize<List<Currency>>(cachedCurrencies);
        }
        else
        {
            // Получаем список кодов валют, к которым у пользователя есть доступ
            var accessibleCurrencyCodes = await _context.UserCurrencyAccesses
                .Where(uca => uca.UserId == userId)
                .Select(uca => uca.CurrencyCode)
                .ToListAsync();
            
            // Возвращаем пустой список, если доступов нет
            if (!accessibleCurrencyCodes.Any())
                return Ok(new List<Currency>());
            
            // Загружаем из таблицы Currencies только те валюты, к которым есть доступ
            currencies = await _context.Currencies
                .Where(c => accessibleCurrencyCodes.Contains(c.CurrencyCode))
                .AsNoTracking()
                .OrderBy(c => c.CurrencyCode)
                .ToListAsync();

            // Кэшируем персональный список
            var serializedCurrencies = JsonSerializer.Serialize(currencies);
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            await _cache.SetStringAsync(cacheKey, serializedCurrencies, cacheOptions);
        }

        return Ok(currencies);
    }
}