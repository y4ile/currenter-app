/*
 *       @Author: yaile
 */

using Currenter.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Currenter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CurrenciesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    // Внедряем DbContext через конструктор
    public CurrenciesController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    // [GET] /api/currencies
    [HttpGet]
    public async Task<IActionResult> GetCurrencies()
    {
        // Асинхронно получаем все валюты из базы данных, отсортированные по коду для предсказуемого порядка
        var currencies = await _context.Currencies
            .AsNoTracking() // Используем для read-only операций, это повышает производительность
            .OrderBy(c => c.CurrencyCode)
            .ToListAsync();

        return Ok(currencies);
    }
}