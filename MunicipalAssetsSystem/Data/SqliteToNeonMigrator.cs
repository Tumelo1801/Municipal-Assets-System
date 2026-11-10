
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Models;
using Npgsql;

namespace MunicipalAssetsSystem.Data
{
    public static class SqliteToNeonMigrator
    {
        private static readonly TimeZoneInfo SouthAfricanTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows()
                    ? "South Africa Standard Time"
                    : "Africa/Johannesburg");

        private static DateTime ConvertToUtc(DateTime value)
        {
            // Historical SQLite timestamps represent South African time.
            var localTime = DateTime.SpecifyKind(
                value,
                DateTimeKind.Unspecified);

            return TimeZoneInfo.ConvertTimeToUtc(
                localTime,
                SouthAfricanTimeZone);
        }

        public static async Task RunAsync(
            string sqlitePath,
            string postgresConnectionString)
        {
            var sqliteConnectionString =
                new SqliteConnectionStringBuilder
                {
                    DataSource = sqlitePath,
                    Mode = SqliteOpenMode.ReadOnly
                }.ToString();

            await using var sqliteConnection =
                new SqliteConnection(sqliteConnectionString);

            await sqliteConnection.OpenAsync();

            var sqliteOptions =
                new DbContextOptionsBuilder<ApplicationDbContext>()
                    .UseSqlite(sqliteConnection)
                    .Options;

            var postgresOptions =
                new DbContextOptionsBuilder<PostgresApplicationDbContext>()
                    .UseNpgsql(postgresConnectionString)
                    .Options;

            await using var source =
                new ApplicationDbContext(sqliteOptions);

            await using var destination =
                new PostgresApplicationDbContext(postgresOptions);

            Console.WriteLine("Checking Neon connection...");

            if (!await destination.Database.CanConnectAsync())
            {
                throw new InvalidOperationException(
                    "Could not connect to Neon.");
            }

            Console.WriteLine("Neon connection successful.");

            // Refuse to overwrite existing destination data.
            if (await destination.Admins.AnyAsync() ||
                await destination.Facilities.AnyAsync() ||
                await destination.Bookings.AnyAsync() ||
                await destination.Inspections.AnyAsync())
            {
                throw new InvalidOperationException(
                    "Neon already contains application records. " +
                    "Transfer cancelled to prevent overwriting data.");
            }

            // Read the source records.
            var admins = await source.Admins
                .AsNoTracking()
                .ToListAsync();

            var facilities = await source.Facilities
                .AsNoTracking()
                .ToListAsync();

            var bookings = await source.Bookings
                .AsNoTracking()
                .ToListAsync();

            var inspections = await source.Inspections
                .AsNoTracking()
                .ToListAsync();

            Console.WriteLine("Source records loaded:");
            Console.WriteLine($"Admins: {admins.Count}");
            Console.WriteLine($"Facilities: {facilities.Count}");
            Console.WriteLine($"Bookings: {bookings.Count}");
            Console.WriteLine($"Inspections: {inspections.Count}");

            // Convert historical timestamps to UTC.
            foreach (var admin in admins)
            {
                admin.CreatedDate = ConvertToUtc(admin.CreatedDate);
            }

            foreach (var facility in facilities)
            {
                facility.CreatedDate =
                    ConvertToUtc(facility.CreatedDate);
            }

            foreach (var booking in bookings)
            {
                booking.BookingDate = DateTime.SpecifyKind(
                    booking.BookingDate.Date,
                    DateTimeKind.Unspecified);

                booking.RequestDate =
                    ConvertToUtc(booking.RequestDate);

                booking.Facility = null;
            }

            foreach (var inspection in inspections)
            {
                inspection.InspectionDate =
                    ConvertToUtc(inspection.InspectionDate);

                inspection.Booking = null;
            }

            // Transfer everything in one PostgreSQL transaction.
            await using var transaction =
                await destination.Database.BeginTransactionAsync();

            destination.Admins.AddRange(admins);
            await destination.SaveChangesAsync();

            destination.Facilities.AddRange(facilities);
            await destination.SaveChangesAsync();

            destination.Bookings.AddRange(bookings);
            await destination.SaveChangesAsync();

            destination.Inspections.AddRange(inspections);
            await destination.SaveChangesAsync();

            // Reset PostgreSQL identity sequences after preserving IDs.
            var tables = new[]
            {
                "Admins",
                "Facilities",
                "Bookings",
                "Inspections"
            };

            foreach (var table in tables)
            {
                var sql = $"""
                    SELECT setval(
                        pg_get_serial_sequence('"{table}"', 'Id'),
                        COALESCE(MAX("Id"), 1),
                        MAX("Id") IS NOT NULL
                    )
                    FROM "{table}";
                    """;

                await destination.Database.ExecuteSqlRawAsync(sql);
            }

            // Verify transferred record counts before committing.
            var transferredAdmins =
                await destination.Admins.CountAsync();

            var transferredFacilities =
                await destination.Facilities.CountAsync();

            var transferredBookings =
                await destination.Bookings.CountAsync();

            var transferredInspections =
                await destination.Inspections.CountAsync();

            if (transferredAdmins != admins.Count ||
                transferredFacilities != facilities.Count ||
                transferredBookings != bookings.Count ||
                transferredInspections != inspections.Count)
            {
                throw new InvalidOperationException(
                    "Record verification failed. Transaction will be rolled back.");
            }

            await transaction.CommitAsync();

            Console.WriteLine();
            Console.WriteLine("DATA TRANSFER COMPLETED SUCCESSFULLY");
            Console.WriteLine("-------------------------------------");
            Console.WriteLine($"Admins: {transferredAdmins}");
            Console.WriteLine($"Facilities: {transferredFacilities}");
            Console.WriteLine($"Bookings: {transferredBookings}");
            Console.WriteLine($"Inspections: {transferredInspections}");
            Console.WriteLine(
                $"Total records: {transferredAdmins + transferredFacilities + transferredBookings + transferredInspections}");
        }
    }
}
