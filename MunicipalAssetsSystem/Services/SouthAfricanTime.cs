namespace MunicipalAssetsSystem.Services
{
    public static class SouthAfricanTime
    {
        private static readonly TimeZoneInfo TimeZone =
            TimeZoneInfo.FindSystemTimeZoneById(
                OperatingSystem.IsWindows()
                    ? "South Africa Standard Time"
                    : "Africa/Johannesburg");

        public static DateTime Now =>
            TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZone);

        public static DateTime ToLocalDate(DateTime date)
        {
            if (date.Kind == DateTimeKind.Utc)
            {
                return TimeZoneInfo.ConvertTimeFromUtc(date, TimeZone).Date;
            }

            if (date.Kind == DateTimeKind.Local)
            {
                return TimeZoneInfo.ConvertTime(date, TimeZone).Date;
            }

            return date.Date;
        }
    }
}