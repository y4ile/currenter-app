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
    public DbSet<UserCurrencyAccess> UserCurrencyAccesses { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserCurrencyAccess>()
            .HasKey(uca => new { uca.UserId, uca.CurrencyCode });

        modelBuilder.Entity<UserCurrencyAccess>()
            .HasOne(uca => uca.User)
            .WithMany()
            .HasForeignKey(uca => uca.UserId);

        modelBuilder.Entity<UserCurrencyAccess>()
            .HasOne(uca => uca.Currency)
            .WithMany()
            .HasForeignKey(uca => uca.CurrencyCode);
    }
}