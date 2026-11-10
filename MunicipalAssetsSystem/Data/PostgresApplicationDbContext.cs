using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Models;

namespace MunicipalAssetsSystem.Data
{
    public class PostgresApplicationDbContext : ApplicationDbContext
    {
        public PostgresApplicationDbContext(
            DbContextOptions<PostgresApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Booking>()
                .Property(b => b.BookingDate)
                .HasColumnType("date");
        }
    }
}