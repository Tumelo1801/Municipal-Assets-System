using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Models;


namespace MunicipalAssetsSystem.Endpoints
{
    public static class InspectionEndpoints
    {
        public static void MapInspectionEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/inspections").WithTags("Inspections");

            // GET: Get all inspections
            group.MapGet("/", async (ApplicationDbContext db) =>
            {
                return await db.Inspections
                    .Include(i => i.Booking)
                        .ThenInclude(b => b!.Facility)
                    .OrderByDescending(i => i.InspectionDate)
                    .ToListAsync();
            });

            // GET: Get inspection by ID
            group.MapGet("/{id}", async (int id, ApplicationDbContext db) =>
            {
                var inspection = await db.Inspections
                    .Include(i => i.Booking)
                        .ThenInclude(b => b!.Facility)
                    .FirstOrDefaultAsync(i => i.Id == id);
                    
                return inspection is not null ? Results.Ok(inspection) : Results.NotFound();
            });

            // GET: Get inspections by booking ID
            group.MapGet("/booking/{bookingId}", async (int bookingId, ApplicationDbContext db) =>
            {
                return await db.Inspections
                    .Include(i => i.Booking)
                        .ThenInclude(b => b!.Facility)
                    .Where(i => i.BookingId == bookingId)
                    .ToListAsync();
            });

            // POST: Create new inspection
            group.MapPost("/", async (Inspection inspection, ApplicationDbContext db) =>
            {
                inspection.InspectionDate = DateTime.Now;
                
                db.Inspections.Add(inspection);
                await db.SaveChangesAsync();

                // Update booking status to Completed
                var booking = await db.Bookings.FindAsync(inspection.BookingId);
                if (booking is not null)
                {
                    booking.Status = "Completed";
                    await db.SaveChangesAsync();
                }

                return Results.Created($"/api/inspections/{inspection.Id}", inspection);
            });

            // PUT: Update inspection
            group.MapPut("/{id}", async (int id, Inspection updatedInspection, ApplicationDbContext db) =>
            {
                var inspection = await db.Inspections.FindAsync(id);
                if (inspection is null) return Results.NotFound();

                inspection.InspectorName = updatedInspection.InspectorName;
                inspection.InspectorContact = updatedInspection.InspectorContact;
                inspection.ConditionBefore = updatedInspection.ConditionBefore;
                inspection.ConditionAfter = updatedInspection.ConditionAfter;
                inspection.DamagesFound = updatedInspection.DamagesFound;
                inspection.DamageDescription = updatedInspection.DamageDescription;
                inspection.DamagePhotos = updatedInspection.DamagePhotos;
                inspection.InspectionNotes = updatedInspection.InspectionNotes;

                await db.SaveChangesAsync();
                return Results.Ok(inspection);
            });

            // DELETE: Delete inspection
            group.MapDelete("/{id}", async (int id, ApplicationDbContext db) =>
            {
                var inspection = await db.Inspections.FindAsync(id);
                if (inspection is null) return Results.NotFound();

                db.Inspections.Remove(inspection);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
        }
    }
}
