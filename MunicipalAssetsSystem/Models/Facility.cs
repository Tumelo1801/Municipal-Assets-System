namespace MunicipalAssetsSystem.Models
{
    public class Facility
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Building, Park, Facility
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Amenities { get; set; } = string.Empty;
        public string Status { get; set; } = "Available"; // Available, Under Maintenance, Booked
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}
