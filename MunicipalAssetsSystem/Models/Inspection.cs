namespace MunicipalAssetsSystem.Models
{
    public class Inspection
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public Booking? Booking { get; set; } // Navigation property

        public string InspectorName { get; set; } = string.Empty;
        public string InspectorContact { get; set; } = string.Empty;

        public DateTime InspectionDate { get; set; } = DateTime.Now;

        public string ConditionBefore { get; set; } = string.Empty;
        public string ConditionAfter { get; set; } = string.Empty;

        public bool DamagesFound { get; set; } = false;
        public string? DamageDescription { get; set; }
        public string? DamagePhotos { get; set; } // Store file paths or URLs

        public string InspectionNotes { get; set; } = string.Empty;
    }
}
