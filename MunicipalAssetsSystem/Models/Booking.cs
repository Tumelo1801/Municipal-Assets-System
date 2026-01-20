namespace MunicipalAssetsSystem.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int FacilityId { get; set; }
        public Facility? Facility { get; set; } // Navigation property

        public string RequesterName { get; set; } = string.Empty;
        public string RequesterEmail { get; set; } = string.Empty;
        public string RequesterPhone { get; set; } = string.Empty;

        public DateTime BookingDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public string Purpose { get; set; } = string.Empty;
        public int ExpectedAttendees { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Completed
        public DateTime RequestDate { get; set; } = DateTime.Now;
        public string? AdminNotes { get; set; }
    }
}
