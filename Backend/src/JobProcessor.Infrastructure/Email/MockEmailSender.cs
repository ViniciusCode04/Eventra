using JobProcessor.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace JobProcessor.Infrastructure.Email;

public class MockEmailSender : IEmailSender
{
    private readonly ILogger<MockEmailSender> _logger;

    public MockEmailSender(ILogger<MockEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendAsync(string to, string subject, string? body, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "[MOCK] E-mail enviado para {To} com assunto '{Subject}'",
            to,
            subject);

        return Task.CompletedTask;
    }
}
