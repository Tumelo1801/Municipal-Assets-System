
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["MunicipalAssetsSystem.csproj", "./"]
RUN dotnet restore "MunicipalAssetsSystem.csproj"

# Copy source code and publish
COPY . .
RUN dotnet publish "MunicipalAssetsSystem.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["dotnet", "MunicipalAssetsSystem.dll"]
