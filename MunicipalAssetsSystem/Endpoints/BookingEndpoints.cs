using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Models;

namespace MunicipalAssetsSystem.Endpoints
{
    public static class BookingEndpoints
    {
        public static void MapBookingEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/bookings").WithTags("Bookings");
            var adminGroup = group.MapGroup("")
                .RequireAuthorization();

            // GET: Get all bookings (with facility details)
            adminGroup.MapGet("/", async (ApplicationDbContext db) =>
            {
                return await db.Bookings
                    .Include(b => b.Facility)
                    .OrderByDescending(b => b.RequestDate)
                    .ToListAsync();
            });

            // GET: Get booking by ID
            adminGroup.MapGet("/{id}", async (int id, ApplicationDbContext db) =>
            {
                var booking = await db.Bookings
                    .Include(b => b.Facility)
                    .FirstOrDefaultAsync(b => b.Id == id);

                return booking is not null ? Results.Ok(booking) : Results.NotFound();
            });

            // GET: Get bookings by status
            adminGroup.MapGet("/status/{status}", async (string status, ApplicationDbContext db) =>
            {
                return await db.Bookings
                    .Include(b => b.Facility)
                    .Where(b => b.Status == status)
                    .OrderByDescending(b => b.RequestDate)
                    .ToListAsync();
            });

            // POST: Create new booking request
            group.MapPost("/", async (Booking booking, ApplicationDbContext db) =>
            {
                booking.Status = "Pending";
                booking.RequestDate = DateTime.Now;

                db.Bookings.Add(booking);
                await db.SaveChangesAsync();
                return Results.Created($"/api/bookings/{booking.Id}", booking);
            });

            // PUT: Update booking status (Approve/Reject)
            adminGroup.MapPut("/{id}/status", async (int id, string status, string? adminNotes, ApplicationDbContext db) =>
            {
                var booking = await db.Bookings.FindAsync(id);
                if (booking is null) return Results.NotFound();

                booking.Status = status;
                booking.AdminNotes = adminNotes;

                await db.SaveChangesAsync();
                return Results.Ok(booking);
            });

            // DELETE: Delete booking
            adminGroup.MapDelete("/{id}", async (int id, ApplicationDbContext db) =>
            {
                var booking = await db.Bookings.FindAsync(id);
                if (booking is null) return Results.NotFound();

                db.Bookings.Remove(booking);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
        }

    }
}
