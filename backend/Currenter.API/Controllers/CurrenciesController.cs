/*
 *       @Author: yaile
 */

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
        const string cacheKey = "all_currencies";
        List<Currency> currencies;
        
        var cachedCurrencies = await _cache.GetStringAsync(cacheKey);
        
        if (cachedCurrencies != null)
        {
            // Данные найдены в кэше. Десериализуем их в правильный тип List<Currency>.
            currencies = JsonSerializer.Deserialize<List<Currency>>(cachedCurrencies);
        }
        else
        {
            // Данных в кэше нет, идем в базу данных.
            currencies = await _context.Currencies
                .AsNoTracking()
                .OrderBy(c => c.CurrencyCode)
                .ToListAsync();

            // Сериализуем и сохраняем данные в кэш на 10 минут.
            var serializedCurrencies = JsonSerializer.Serialize(currencies);
            var cacheOptions = new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            await _cache.SetStringAsync(cacheKey, serializedCurrencies, cacheOptions);
        }

        return Ok(currencies);
    }
}