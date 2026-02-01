# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /source

# Copy the solution and project files
COPY MunicipalAssetsSystem/*.csproj ./MunicipalAssetsSystem/
WORKDIR /source/MunicipalAssetsSystem
RUN dotnet restore

# Copy the rest of the source code
WORKDIR /source
COPY MunicipalAssetsSystem/. ./MunicipalAssetsSystem/

# Build the project
WORKDIR /source/MunicipalAssetsSystem
RUN dotnet publish -c Release -o /app --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy the published app from build stage
COPY --from=build /app ./

# Create directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port (Render uses port 10000 by default)
EXPOSE 10000

# Run the application
ENTRYPOINT ["dotnet", "MunicipalAssetsSystem.dll"]
