/*
 *       @Author: yaile
 */

using System.Text.Json;
using Currenter.Api.Data;
using Currenter.Api.DTOs;
using Currenter.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace Currenter.Api.Services;

public class CurrencyUpdateService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _serviceProvider;
    private readonly IDistributedCache _cache;

    public CurrencyUpdateService(IHttpClientFactory httpClientFactory, IConfiguration configuration, IServiceProvider serviceProvider, IDistributedCache cache)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _serviceProvider = serviceProvider;
        _cache = cache;
    }

    public async Task UpdateCurrencyRatesAsync()
    {
        var apiKey = _configuration["ExternalApis:ExchangeRateApi:ApiKey"];
        var baseUrl = _configuration["ExternalApis:ExchangeRateApi:BaseUrl"];
        
        // Мы будем получать все курсы по отношению к доллару США (USD)
        var requestUrl = $"{baseUrl}{apiKey}/latest/USD";

        var client = _httpClientFactory.CreateClient();
        var response = await client.GetAsync(requestUrl);

        if (!response.IsSuccessStatusCode)
        {
            // TODO: добавить логирование ошибки
            Console.WriteLine("Error fetching currency rates from external API.");
            return;
        }

        var content = await response.Content.ReadAsStringAsync();
        var apiResponse = JsonSerializer.Deserialize<ExchangeRateApiResponseDto>(content);

        if (apiResponse?.ConversionRates == null)
        {
            Console.WriteLine("Failed to deserialize or no conversion rates found.");
            return;
        }

        // Создаем новый scope для DbContext, так как этот сервис будет синглтоном
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        foreach (var rate in apiResponse.ConversionRates)
        {
            var currency = await context.Currencies.FindAsync(rate.Key);

            if (currency != null)
            {
                // Обновляем существующую валюту
                currency.Rate = rate.Value;
                currency.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                // Добавляем новую валюту
                context.Currencies.Add(new Currency
                {
                    CurrencyCode = rate.Key,
                    Rate = rate.Value,
                    LastUpdated = DateTime.UtcNow
                });
            }
        }

        await context.SaveChangesAsync();
        Console.WriteLine("Successfully updated currency rates.");
        
        const string cacheKey = "all_currencies";
        var currenciesFromDb = await context.Currencies.AsNoTracking().OrderBy(c => c.CurrencyCode).ToListAsync();
        var serializedCurrencies = JsonSerializer.Serialize(currenciesFromDb);
        var cacheOptions = new DistributedCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
        await _cache.SetStringAsync(cacheKey, serializedCurrencies, cacheOptions);
        Console.WriteLine("Cache has been updated.");
    }
}