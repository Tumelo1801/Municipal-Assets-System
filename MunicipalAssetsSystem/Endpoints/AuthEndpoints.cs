
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Models;
using MunicipalAssetsSystem.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Net.Mail;

namespace MunicipalAssetsSystem.Endpoints
{
    public static class AuthEndpoints
    {
        private const string Issuer = "MunicipalAssetsSystem";
        private const string Audience = "MunicipalAssetsSystem";

        private static readonly PasswordHasher<Admin> PasswordHasher = new();

        public static void MapAuthEndpoints(this WebApplication app)
        {
            var group = app.MapGroup("/api/auth")
                .WithTags("Authentication");

            // LOGIN
            group.MapPost("/login", async (
                LoginRequest request,
                ApplicationDbContext db,
                IConfiguration configuration) =>
            {
                if (string.IsNullOrWhiteSpace(request.Username) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return Results.BadRequest("Username and password are required.");
                }

                var admin = await db.Admins.FirstOrDefaultAsync(
                    a => a.Username == request.Username);

                if (admin == null)
                    return Results.Unauthorized();

                var legacyHash = HashLegacyPassword(request.Password);

                if (admin.PasswordHash == legacyHash)
                {
                    admin.PasswordHash = PasswordHasher.HashPassword(
                        admin, request.Password);

                    await db.SaveChangesAsync();
                }
                else
                {
                    var verificationResult = PasswordHasher.VerifyHashedPassword(
                        admin, admin.PasswordHash, request.Password);

                    if (verificationResult == PasswordVerificationResult.Failed)
                        return Results.Unauthorized();

                    if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
                    {
                        admin.PasswordHash = PasswordHasher.HashPassword(
                            admin, request.Password);

                        await db.SaveChangesAsync();
                    }
                }

                var secret = configuration["Jwt:Secret"];

                if (string.IsNullOrWhiteSpace(secret))
                {
                    return Results.Problem(
                        "Authentication configuration is unavailable.",
                        statusCode: 500);
                }

                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(secret));

                var credentials = new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
                    new Claim(ClaimTypes.Name, admin.Username),
                    new Claim(ClaimTypes.Role, "Admin")
                };

                var token = new JwtSecurityToken(
                    issuer: Issuer,
                    audience: Audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(60),
                    signingCredentials: credentials);

                var tokenString = new JwtSecurityTokenHandler()
                    .WriteToken(token);

                return Results.Ok(new LoginResponse
                {
                    Success = true,
                    Token = tokenString,
                    AdminId = admin.Id,
                    Username = admin.Username,
                    FullName = admin.FullName,
                    Email = admin.Email
                });
            });

            // FORGOT PASSWORD
            group.MapPost("/forgot-password", async (
                ForgotPasswordRequest request,
                ApplicationDbContext db,
                EmailService emailService,
                IConfiguration configuration,
                ILoggerFactory loggerFactory) =>
            {
                const string genericMessage =
                    "If an administrator account exists for that email, a password reset link will be sent.";

                var logger = loggerFactory.CreateLogger("AuthEndpoints");

                if (string.IsNullOrWhiteSpace(request.Email))
                    return Results.Ok(new { message = genericMessage });

                var email = request.Email.Trim().ToLower();

                var admin = await db.Admins.FirstOrDefaultAsync(
                    a => a.Email.ToLower() == email);

                if (admin == null)
                    return Results.Ok(new { message = genericMessage });

                var previousTokens = await db.PasswordResetTokens
                    .Where(t => t.AdminId == admin.Id && !t.IsUsed)
                    .ToListAsync();

                db.PasswordResetTokens.RemoveRange(previousTokens);

                var randomBytes = RandomNumberGenerator.GetBytes(32);

                var resetToken = Convert.ToBase64String(randomBytes)
                    .Replace("+", "-")
                    .Replace("/", "_")
                    .TrimEnd('=');

                var tokenHash = Convert.ToHexString(
                    SHA256.HashData(Encoding.UTF8.GetBytes(resetToken)));

                db.PasswordResetTokens.Add(new PasswordResetToken
                {
                    AdminId = admin.Id,
                    TokenHash = tokenHash,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(30),
                    IsUsed = false
                });

                await db.SaveChangesAsync();

                var frontendUrl = configuration["Frontend:BaseUrl"];

                if (string.IsNullOrWhiteSpace(frontendUrl))
                {
                    logger.LogError("Frontend reset URL is not configured.");
                    return Results.Ok(new { message = genericMessage });
                }

                var resetLink =
                    $"{frontendUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(resetToken)}";

                try
                {
                    await emailService.SendPasswordResetEmailAsync(
                        admin.Email, resetLink);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to send password reset email.");

                    var unusableToken = await db.PasswordResetTokens
                        .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

                    if (unusableToken != null)
                    {
                        db.PasswordResetTokens.Remove(unusableToken);
                        await db.SaveChangesAsync();
                    }
                }

                return Results.Ok(new { message = genericMessage });
            });

            // RESET PASSWORD
            group.MapPost("/reset-password", async (
                ResetPasswordRequest request,
                ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.Token) ||
                    string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return Results.BadRequest(new
                    {
                        message = "Reset token and new password are required."
                    });
                }

                if (request.NewPassword.Length < 12 ||
                    !request.NewPassword.Any(char.IsUpper) ||
                    !request.NewPassword.Any(char.IsLower) ||
                    !request.NewPassword.Any(char.IsDigit) ||
                    !request.NewPassword.Any(c => !char.IsLetterOrDigit(c)))
                {
                    return Results.BadRequest(new
                    {
                        message = "Password must be at least 12 characters and include uppercase, lowercase, numeric and special characters."
                    });
                }

                var tokenHash = Convert.ToHexString(
                    SHA256.HashData(Encoding.UTF8.GetBytes(request.Token)));

                var resetRecord = await db.PasswordResetTokens
                    .Include(t => t.Admin)
                    .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

                if (resetRecord == null ||
                    resetRecord.IsUsed ||
                    resetRecord.ExpiresAt <= DateTime.UtcNow)
                {
                    return Results.BadRequest(new
                    {
                        message = "This password reset link is invalid or has expired."
                    });
                }

                resetRecord.Admin.PasswordHash = PasswordHasher.HashPassword(
                    resetRecord.Admin, request.NewPassword);

                resetRecord.IsUsed = true;

                var otherTokens = await db.PasswordResetTokens
                    .Where(t => t.AdminId == resetRecord.AdminId &&
                                t.Id != resetRecord.Id &&
                                !t.IsUsed)
                    .ToListAsync();

                foreach (var token in otherTokens)
                    token.IsUsed = true;

                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    message = "Your password has been reset successfully. You can now log in."
                });
            });

            // PUBLIC REGISTRATION DISABLED
            group.MapPost("/register", () =>
                Results.StatusCode(StatusCodes.Status403Forbidden));

            // GET ALL ADMINISTRATORS
            group.MapGet("/admins", async (ApplicationDbContext db) =>
            {
                var admins = await db.Admins
                    .OrderBy(a => a.FullName)
                    .Select(a => new
                    {
                        a.Id,
                        a.FullName,
                        a.Username,
                        a.Email,
                        a.CreatedDate
                    })
                    .ToListAsync();

                return Results.Ok(admins);
            })
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

            // CREATE ADMINISTRATOR
            group.MapPost("/admins", async (
                CreateAdminRequest request,
                ApplicationDbContext db) =>
            {
                var fullName = request.FullName?.Trim();
                var username = request.Username?.Trim();
                var email = request.Email?.Trim();

                if (string.IsNullOrWhiteSpace(fullName) ||
                    string.IsNullOrWhiteSpace(username) ||
                    string.IsNullOrWhiteSpace(email) ||
                    string.IsNullOrWhiteSpace(request.Password))
                {
                    return Results.BadRequest(new
                    {
                        message = "All fields are required."
                    });
                }

                try
                {
                    var parsedEmail = new MailAddress(email);

                    if (parsedEmail.Address != email)
                    {
                        return Results.BadRequest(new
                        {
                            message = "Please enter a valid email address."
                        });
                    }
                }
                catch
                {
                    return Results.BadRequest(new
                    {
                        message = "Please enter a valid email address."
                    });
                }

                var password = request.Password;

                if (password.Length < 12 ||
                    !password.Any(char.IsUpper) ||
                    !password.Any(char.IsLower) ||
                    !password.Any(char.IsDigit) ||
                    !password.Any(c => !char.IsLetterOrDigit(c)))
                {
                    return Results.BadRequest(new
                    {
                        message = "Password must contain at least 12 characters, including uppercase, lowercase, a number and a special character."
                    });
                }

                if (await db.Admins.AnyAsync(a =>
                    a.Username.ToLower() == username.ToLower()))
                {
                    return Results.BadRequest(new
                    {
                        message = "This username is already registered."
                    });
                }

                if (await db.Admins.AnyAsync(a =>
                    a.Email.ToLower() == email.ToLower()))
                {
                    return Results.BadRequest(new
                    {
                        message = "An administrator with this email already exists."
                    });
                }

                var newAdmin = new Admin
                {
                    FullName = fullName,
                    Username = username,
                    Email = email,
                    CreatedDate = DateTime.UtcNow
                };

                newAdmin.PasswordHash = PasswordHasher.HashPassword(
                    newAdmin, password);

                db.Admins.Add(newAdmin);
                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    success = true,
                    message = "Administrator created successfully.",
                    admin = new
                    {
                        newAdmin.Id,
                        newAdmin.FullName,
                        newAdmin.Username,
                        newAdmin.Email,
                        newAdmin.CreatedDate
                    }
                });
            })
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

            // ADMINISTRATOR PASSWORD RESET
            group.MapPost("/admins/{id:int}/reset-password", async (
                int id,
                AdminPasswordResetRequest request,
                ApplicationDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(request.NewPassword))
                {
                    return Results.BadRequest(new
                    {
                        message = "A new password is required."
                    });
                }

                var password = request.NewPassword;

                if (password.Length < 12 ||
                    !password.Any(char.IsUpper) ||
                    !password.Any(char.IsLower) ||
                    !password.Any(char.IsDigit) ||
                    !password.Any(c => !char.IsLetterOrDigit(c)))
                {
                    return Results.BadRequest(new
                    {
                        message = "Password must contain at least 12 characters, including uppercase, lowercase, a number and a special character."
                    });
                }

                var admin = await db.Admins.FirstOrDefaultAsync(a => a.Id == id);

                if (admin == null)
                {
                    return Results.NotFound(new
                    {
                        message = "Administrator account not found."
                    });
                }

                admin.PasswordHash = PasswordHasher.HashPassword(admin, password);

                var outstandingTokens = await db.PasswordResetTokens
                    .Where(t => t.AdminId == admin.Id && !t.IsUsed)
                    .ToListAsync();

                foreach (var token in outstandingTokens)
                {
                    token.IsUsed = true;
                }

                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    success = true,
                    message = "Administrator password reset successfully."
                });
            })
            .RequireAuthorization(policy => policy.RequireRole("Admin"));
        }

        private static string HashLegacyPassword(string password)
        {
            using var sha256 = SHA256.Create();

            var hashedBytes = sha256.ComputeHash(
                Encoding.UTF8.GetBytes(password));

            return Convert.ToBase64String(hashedBytes);
        }
    }

    public record LoginRequest(string Username, string Password);

    public record RegisterRequest(
        string Username,
        string Password,
        string FullName,
        string Email);

    public record LoginResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public int AdminId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public record ForgotPasswordRequest(string Email);

    public record ResetPasswordRequest(
        string Token,
        string NewPassword);

    public record CreateAdminRequest(
        string FullName,
        string Username,
        string Email,
        string Password);

    public record AdminPasswordResetRequest(string NewPassword);
}
