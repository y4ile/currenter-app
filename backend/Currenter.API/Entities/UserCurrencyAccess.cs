/*
 *       @Author: yaile
 */

namespace Currenter.Api.Entities;

public class UserCurrencyAccess
{
    public int UserId { get; set; }
    public User User { get; set; }

    public string CurrencyCode { get; set; }
    public Currency Currency { get; set; }
}