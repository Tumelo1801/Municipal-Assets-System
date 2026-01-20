using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Models;

namespace MunicipalAssetsSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Facility> Facilities { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Inspection> Inspections { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Facility)
                .WithMany()
                .HasForeignKey(b => b.FacilityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Inspection>()
                .HasOne(i => i.Booking)
                .WithMany()
                .HasForeignKey(i => i.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
