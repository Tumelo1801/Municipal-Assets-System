using Microsoft.EntityFrameworkCore;
using MunicipalAssetsSystem.Data;
using MunicipalAssetsSystem.Endpoints;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT") ??
           (builder.Environment.IsDevelopment() ? "5242" : "10000");
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add SQLite Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=municipal_assets.db"));

// Add CORS to allow React app to communicate with API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true) 
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


app.UseCors("AllowAll");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS - Must be before UseHttpsRedirection
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

// Register API Endpoints
app.MapFacilityEndpoints();
app.MapBookingEndpoints();
app.MapInspectionEndpoints();
app.MapAuthEndpoints();


app.Run();