﻿/*
 *       @Author: yaile
 */

using Currenter.Api.Data;
using Currenter.Api.DTOs;
using Currenter.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Currenter.Api.Services;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IJwtService jwtService, IConfiguration configuration)
    {
        _context = context;
        _jwtService = jwtService;
        _configuration = configuration;
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
            PasswordHash = passwordHash,
            Role = "User"
        };
        
        // Сохранение в БД
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        // Предоставление доступа к валютам
        // Считываем список валют по умолчанию из appsettings.json
        var defaultCurrencies = _configuration.GetSection("DefaultCurrencyAccess").Get<List<string>>();

        if (defaultCurrencies != null)
        {
            foreach (var currencyCode in defaultCurrencies)
            {
                var accessEntry = new UserCurrencyAccess
                {
                    UserId = user.Id,
                    CurrencyCode = currencyCode
                };
                _context.UserCurrencyAccesses.Add(accessEntry);
            }
        }

        // Сохраняем данные о валютах
        await _context.SaveChangesAsync();

        return Ok(new { message = "User registered successfully." });
    }
    
    // [POST] /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var jwtToken = _jwtService.GenerateToken(user);

        return Ok(new { token = jwtToken });
    }
}