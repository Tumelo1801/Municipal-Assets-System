using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace MunicipalAssetsSystem.Data
{
    public class PostgresApplicationDbContextFactory
        : IDesignTimeDbContextFactory<PostgresApplicationDbContext>
    {
        public PostgresApplicationDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .AddUserSecrets<PostgresApplicationDbContextFactory>()
                .Build();

            var connectionString =
                configuration.GetConnectionString("Neon");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "Neon connection string was not found in User Secrets.");
            }

            var optionsBuilder =
                new DbContextOptionsBuilder<PostgresApplicationDbContext>();

            optionsBuilder.UseNpgsql(connectionString);

            return new PostgresApplicationDbContext(
                optionsBuilder.Options);
        }
    }
}