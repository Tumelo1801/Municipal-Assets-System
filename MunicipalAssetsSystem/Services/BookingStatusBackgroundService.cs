
using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Data;

namespace MunicipalAssetsSystem.Services
{
    public class BookingStatusBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BookingStatusBackgroundService> _logger;

        public BookingStatusBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<BookingStatusBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Booking status background service started.");

            using var timer = new PeriodicTimer(
                TimeSpan.FromMinutes(5));

            // Run once immediately when the application starts.
            await UpdateExpiredBookings(stoppingToken);

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                await UpdateExpiredBookings(stoppingToken);
            }
        }

       
        private async Task UpdateExpiredBookings(
            CancellationToken stoppingToken)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();

                var db = scope.ServiceProvider
                    .GetRequiredService<ApplicationDbContext>();

                var now = DateTime.Now;

                // Retrieve pending bookings first.
                var pendingBookings = await db.Bookings
                    .Where(b => b.Status == "Pending")
                    .ToListAsync(stoppingToken);

                // Calculate expiry in C# rather than SQL.
                var expiredBookings = pendingBookings
                    .Where(b =>
                        b.BookingDate.Date + b.EndTime < now)
                    .ToList();

                foreach (var booking in expiredBookings)
                {
                    booking.Status = "Unattended";
                    booking.AdminNotes =
                        "Automatically marked as unattended because the booking time passed without administrator action.";
                }

                if (expiredBookings.Count > 0)
                {
                    await db.SaveChangesAsync(stoppingToken);
                }

                _logger.LogInformation(
                    "Booking expiry check completed. Pending: {PendingCount}, Marked unattended: {ExpiredCount}",
                    pendingBookings.Count,
                    expiredBookings.Count);
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                // Application is shutting down.
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error updating expired booking statuses.");
            }
        }

    }
}
