using JobProcessor.Application.Interfaces;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace JobProcessor.Infrastructure.Email;

public class BrevoEmailSender : IEmailSender
{
    private static readonly HttpClient _httpClient = new();
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly ILogger<BrevoEmailSender> _logger;

    private const string BrevoEndpoint = "https://api.brevo.com/v3/smtp/email";

    public BrevoEmailSender(
        string apiKey,
        string fromEmail,
        string fromName,
        ILogger<BrevoEmailSender> logger)
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
            sender = new
            {
                email = _fromEmail,
                name = _fromName
            },
            to = new[] { new { email = to } },
            subject,
            textContent = body ?? string.Empty
        };

        var json = JsonSerializer.Serialize(payload);
        using var request = new HttpRequestMessage(HttpMethod.Post, BrevoEndpoint);
        request.Headers.Add("api-key", _apiKey);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException(
                $"Brevo retornou {(int)response.StatusCode}: {errorBody}");
        }

        _logger.LogInformation(
            "E-mail enviado via Brevo para {To} com assunto '{Subject}'",
            to,
            subject);
    }
}
