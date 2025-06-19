/*
 *       @Author: yaile
 */

using Currenter.Api.Services;

namespace Currenter.Api.BackgroundServices;

public class CurrencyRatesUpdater : BackgroundService
{
    private readonly CurrencyUpdateService _currencyUpdateService;

    public CurrencyRatesUpdater(CurrencyUpdateService currencyUpdateService)
    {
        _currencyUpdateService = currencyUpdateService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Выполняем первую загрузку сразу при старте приложения
        await DoWork();

        // Затем запускаем цикл, который будет работать, пока приложение не будет остановлено
        while (!stoppingToken.IsCancellationRequested)
        {
            // Задержка в 1 час
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

            // Выполняем работу
            await DoWork();
        }
    }

    private async Task DoWork()
    {
        try
        {
            await _currencyUpdateService.UpdateCurrencyRatesAsync();
        }
        catch (Exception ex)
        {
            // TODO: добавить логирование
            Console.WriteLine($"An error occurred while updating currency rates: {ex.Message}");
        }
    }
}