using JobProcessor.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace JobProcessor.Infrastructure.Email;

public class SendGridEmailSender : IEmailSender
{
    private static readonly HttpClient _httpClient = new();
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly ILogger<SendGridEmailSender> _logger;

    private const string SendGridEndpoint = "https://api.sendgrid.com/v3/mail/send";

    public SendGridEmailSender(
        string apiKey,
        string fromEmail,
        string fromName,
        ILogger<SendGridEmailSender> logger)
    {
        _apiKey = apiKey;
        _fromEmail = fromEmail;
        _fromName = fromName;
        _logger = logger;
    }

    public async Task SendAsync(
        string to,
        string subject,
        string? body,
        CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            personalizations = new[]
            {
                new
                {
                    to = new[] { new { email = to } }
                }
            },
            from = new
            {
                email = _fromEmail,
                name = _fromName
            },
            subject,
            content = new[]
            {
                new
                {
                    type = "text/plain",
                    value = body ?? string.Empty
                }
            }
        };

        var json = JsonSerializer.Serialize(payload);
        using var request = new HttpRequestMessage(HttpMethod.Post, SendGridEndpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"SendGrid retornou {(int)response.StatusCode}: {errorBody}");
        }

        _logger.LogInformation(
            "E-mail enviado via SendGrid para {To} com assunto '{Subject}'",
            to,
            subject);
    }
}
