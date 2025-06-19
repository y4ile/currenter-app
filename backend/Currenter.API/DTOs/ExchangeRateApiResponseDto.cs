/*
 *       @Author: yaile
 */

using System.Text.Json.Serialization;

namespace Currenter.Api.DTOs;

public class ExchangeRateApiResponseDto
{
    [JsonPropertyName("result")]
    public string Result { get; set; }

    [JsonPropertyName("base_code")]
    public string BaseCode { get; set; }

    [JsonPropertyName("conversion_rates")]
    public Dictionary<string, decimal> ConversionRates { get; set; }
}