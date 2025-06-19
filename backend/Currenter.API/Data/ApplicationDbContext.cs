/*
 *       @Author: yaile
 */

using Currenter.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Currenter.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Currency> Currencies { get; set; }
}