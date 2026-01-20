using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Models;

namespace MunicipalAssetsSystem.Endpoints
{
    public static class FacilityEndpoints
    {
        public static void MapFacilityEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/facilities").WithTags("Facilities");

            // GET: Get all facilities
            group.MapGet("/", async (ApplicationDbContext db) =>
            {
                return await db.Facilities.ToListAsync();
            });

            // GET: Get facility by ID
            group.MapGet("/{id}", async (int id, ApplicationDbContext db) =>
            {
                var facility = await db.Facilities.FindAsync(id);
                return facility is not null ? Results.Ok(facility) : Results.NotFound();
            });

            // POST: Create new facility
            group.MapPost("/", async (Facility facility, ApplicationDbContext db) =>
            {
                db.Facilities.Add(facility);
                await db.SaveChangesAsync();
                return Results.Created($"/api/facilities/{facility.Id}", facility);
            });

            // PUT: Update facility
            group.MapPut("/{id}", async (int id, Facility updatedFacility, ApplicationDbContext db) =>
            {
                var facility = await db.Facilities.FindAsync(id);
                if (facility is null) return Results.NotFound();

                facility.Name = updatedFacility.Name;
                facility.Type = updatedFacility.Type;
                facility.Location = updatedFacility.Location;
                facility.Description = updatedFacility.Description;
                facility.Capacity = updatedFacility.Capacity;
                facility.Amenities = updatedFacility.Amenities;
                facility.Status = updatedFacility.Status;

                await db.SaveChangesAsync();
                return Results.Ok(facility);
            });

            // DELETE: Delete facility
            group.MapDelete("/{id}", async (int id, ApplicationDbContext db) =>
            {
                var facility = await db.Facilities.FindAsync(id);
                if (facility is null) return Results.NotFound();

                db.Facilities.Remove(facility);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });
        }
    }
}
