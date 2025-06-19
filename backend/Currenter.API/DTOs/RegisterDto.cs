/*
 *       @Author: yaile
 */

using System.ComponentModel.DataAnnotations;

namespace Currenter.Api.DTOs;

public class RegisterDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; }

    [Required]
    [MinLength(8)]
    public string Password { get; set; }
}