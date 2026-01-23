using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Models;
using System.Security.Cryptography;
using System.Text;

namespace MunicipalAssetsSystem.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/auth").WithTags("Authentication");

            // Login endpoint
            group.MapPost("/login", async (LoginRequest request, ApplicationDbContext db) =>
            {
                var passwordHash = HashPassword(request.Password);
                var admin = await db.Admins
                    .FirstOrDefaultAsync(a => a.Username == request.Username && a.PasswordHash == passwordHash);

                if (admin == null)
                {
                    return Results.Unauthorized();
                }

                return Results.Ok(new LoginResponse
                {
                    Success = true,
                    AdminId = admin.Id,
                    Username = admin.Username,
                    FullName = admin.FullName,
                    Email = admin.Email
                });
            });

            // Register admin (for initial setup)
            group.MapPost("/register", async (RegisterRequest request, ApplicationDbContext db) =>
            {
                // Check if username already exists
                var exists = await db.Admins.AnyAsync(a => a.Username == request.Username);
                if (exists)
                {
                    return Results.BadRequest("Username already exists");
                }

                var admin = new Admin
                {
                    Username = request.Username,
                    PasswordHash = HashPassword(request.Password),
                    FullName = request.FullName,
                    Email = request.Email
                };

                db.Admins.Add(admin);
                await db.SaveChangesAsync();

                return Results.Ok(new { Message = "Admin registered successfully" });
            });
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }
    }

    public record LoginRequest(string Username, string Password);
    public record RegisterRequest(string Username, string Password, string FullName, string Email);
    public record LoginResponse
    {
        public bool Success { get; set; }
        public int AdminId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}