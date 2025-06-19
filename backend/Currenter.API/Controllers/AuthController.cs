/*
 *       @Author: yaile
 */

using Currenter.Api.Data;
using Currenter.Api.DTOs;
using Currenter.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    // [POST] /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        // Проверка email'а
        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            return BadRequest("User with this email already exists.");
        }
        
        // Хэширование пароля
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

        // Создание пользователя
        var user = new User
        {
            Name = registerDto.Name,
            Email = registerDto.Email,
            PasswordHash = passwordHash
        };
        
        // Сохранение в БД
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User registered successfully." });
    }
}