namespace MunicipalAssetsSystem.Models
{
    public class PasswordResetToken
    {
        public int Id { get; set; }

        public int AdminId { get; set; }

        public string TokenHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public Admin Admin { get; set; } = null!;
    }
}