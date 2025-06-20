using Currenter.Api.Data;
using Currenter.Api.Services;
using Currenter.Api.BackgroundServices;
using Microsoft.EntityFrameworkCore;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var policyName = "AllowFrontendApp";

// Добавляем кэширование в Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    // "redis" - это имя сервиса из нашего docker-compose.yml
    options.Configuration = "redis:6379"; 
    options.InstanceName = "Currenter_";
});

// Добавляем сервис CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(policyName, policy =>
    {
        policy.WithOrigins("http://localhost:5173") // <-- ВАЖНО: Укажите здесь адрес вашего frontend-приложения
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// Регистрируем DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Добавление JWT авторизации
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddSingleton<CurrencyUpdateService>();
builder.Services.AddHostedService<CurrencyRatesUpdater>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Определяем Security Scheme
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

    // Указываем, что эндпоинты могут требовать эту схему безопасности
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var configuration = services.GetRequiredService<IConfiguration>();

        var adminEmails = configuration.GetSection("AdminUsers").Get<List<string>>() ?? new List<string>();

        foreach (var email in adminEmails)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            // Если пользователь с таким email найден и он еще не админ
            if (user != null && user.Role != "Admin")
            {
                user.Role = "Admin";
                Console.WriteLine($"User {user.Email} has been promoted to Admin.");
            }
            else if (user == null)
                Console.WriteLine($"User {email} not found.");
        }
        // Сохраняем все изменения в базе данных
        await context.SaveChangesAsync();
    }
    catch (Exception ex)
    {
        // Логируем ошибку, если что-то пошло не так
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while promoting admin users.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(policyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); 

app.Run();