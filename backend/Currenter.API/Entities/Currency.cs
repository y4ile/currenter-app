/*
 *       @Author: yaile
 */

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Currenter.Api.Entities;

public class Currency
{
    [Key] // Указываем, что это первичный ключ
    [MaxLength(3)]
    public string CurrencyCode { get; set; }

    [Required]
    [Column(TypeName = "decimal(18, 6)")] // Указываем точный тип данных для денег
    public decimal Rate { get; set; }

    public DateTime LastUpdated { get; set; }
}