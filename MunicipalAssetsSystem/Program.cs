
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Endpoints;
using System.Text;
using MunicipalAssetsSystem.Services;


var builder = WebApplication.CreateBuilder(args);


// Configure backend port
var port = Environment.GetEnvironmentVariable("PORT") ??
           (builder.Environment.IsDevelopment() ? "5242" : "10000");

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");


// Database configuration
var databasePath = Environment.GetEnvironmentVariable("DATABASE_PATH")
                   ?? "municipal_assets.db";

var databaseDirectory = Path.GetDirectoryName(databasePath);

if (!string.IsNullOrWhiteSpace(databaseDirectory))
{
    Directory.CreateDirectory(databaseDirectory);
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite($"Data Source={databasePath}"));

// JWT configuration
var jwtSecret = builder.Configuration["Jwt:Secret"];

if (string.IsNullOrWhiteSpace(jwtSecret))
{
    throw new InvalidOperationException(
        "JWT secret is missing. Configure Jwt:Secret using a secure secret store.");
}

var signingKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(jwtSecret)
);

// Authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "MunicipalAssetsSystem",

            ValidateAudience = true,
            ValidAudience = "MunicipalAssetsSystem",

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

// Authorisation
builder.Services.AddAuthorization();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5175"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHostedService<BookingStatusBackgroundService>();

var app = builder.Build();

// Apply pending database migrations before the application starts
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// Development documentation
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware pipeline
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

// Register API endpoints
app.MapFacilityEndpoints();
app.MapBookingEndpoints();
app.MapInspectionEndpoints();
app.MapAuthEndpoints();

app.Run();
