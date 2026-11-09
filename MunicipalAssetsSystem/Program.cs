
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Endpoints;
using System.Text;
using Resend;
using MunicipalAssetsSystem.Services;

var builder = WebApplication.CreateBuilder(args);
var resendApiKey = builder.Configuration["Resend:ApiKey"];

if (string.IsNullOrWhiteSpace(resendApiKey))
{
    throw new InvalidOperationException("Resend API key is missing.");
}

builder.Services.AddResend(options =>
{
    options.ApiToken = resendApiKey;
});

builder.Services.AddScoped<EmailService>();

// Configure backend port
var port = Environment.GetEnvironmentVariable("PORT") ??
           (builder.Environment.IsDevelopment() ? "5242" : "10000");

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=municipal_assets.db"));

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

var app = builder.Build();

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
