using System.Net;
using Resend;

namespace MunicipalAssetsSystem.Services
{
    public class EmailService
    {
        private readonly IResend _resend;
        private readonly IConfiguration _configuration;

        public EmailService(IResend resend, IConfiguration configuration)
        {
            _resend = resend;
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(
            string recipientEmail,
            string resetLink)
        {
            var sender = _configuration["Resend:FromEmail"]
                         ?? "onboarding@resend.dev";

            var safeLink = WebUtility.HtmlEncode(resetLink);

            var message = new EmailMessage
            {
                From = sender,
                Subject = "Municipal Assets System - Password Reset",
                HtmlBody = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto;'>
                        <h2>Password Reset Request</h2>
                        <p>We received a request to reset your Municipal Assets System password.</p>
                        <p>Click the button below to choose a new password:</p>
                        <p>
                            <a href='{safeLink}'
                               style='background-color: #2589d8; color: white;
                                      padding: 12px 20px; text-decoration: none;
                                      border-radius: 5px; display: inline-block;'>
                                Reset Password
                            </a>
                        </p>
                        <p>This link will expire after 30 minutes.</p>
                        <p>If you did not request this reset, you can safely ignore this email.</p>
                        <p>Municipal Assets System</p>
                    </div>"
            };

            message.To.Add(recipientEmail);

            await _resend.EmailSendAsync(message);
        }
    }
}