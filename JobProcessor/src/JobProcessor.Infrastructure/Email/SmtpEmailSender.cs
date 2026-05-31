using JobProcessor.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;

namespace JobProcessor.Infrastructure.Email;

public class SmtpEmailSender : IEmailSender
{
    private readonly SmtpSettings _settings;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpSettings> settings, ILogger<SmtpEmailSender> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string? body, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.FromEmail))
        {
            throw new InvalidOperationException("Remetente SMTP (FromEmail) não configurado.");
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body ?? string.Empty };

        using var client = new SmtpClient();
        var secureSocketOptions = ResolveSecureSocketOptions();

        await client.ConnectAsync(_settings.Host, _settings.Port, secureSocketOptions, cancellationToken);

        if (!string.IsNullOrWhiteSpace(_settings.User))
        {
            await client.AuthenticateAsync(_settings.User, _settings.Password, cancellationToken);
        }

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);

        _logger.LogInformation(
            "E-mail enviado via SMTP para {To} com assunto '{Subject}'",
            to,
            subject);
    }

    private SecureSocketOptions ResolveSecureSocketOptions()
    {
        if (!_settings.UseSsl)
        {
            return SecureSocketOptions.None;
        }

        return _settings.Port == 465
            ? SecureSocketOptions.SslOnConnect
            : SecureSocketOptions.StartTls;
    }
}
