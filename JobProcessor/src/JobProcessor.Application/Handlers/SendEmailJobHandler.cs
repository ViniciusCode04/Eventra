using System.Text.Json;
using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace JobProcessor.Application.Handlers;

public class SendEmailJobHandler : IJobHandler
{
    private readonly IEmailSender _emailSender;
    private readonly ILogger<SendEmailJobHandler> _logger;

    public SendEmailJobHandler(IEmailSender emailSender, ILogger<SendEmailJobHandler> logger)
    {
        _emailSender = emailSender;
        _logger = logger;
    }

    public string JobType => JobTypes.SendEmail;

    public async Task HandleAsync(Job job, CancellationToken cancellationToken = default)
    {
        var payload = JsonSerializer.Deserialize<SendEmailPayload>(job.Payload, JobPayloadJson.Options)
            ?? throw new InvalidOperationException("Payload de e-mail inválido.");

        if (string.IsNullOrWhiteSpace(payload.To))
        {
            throw new InvalidOperationException("Destinatário do e-mail (to) é obrigatório.");
        }

        if (string.IsNullOrWhiteSpace(payload.Subject))
        {
            throw new InvalidOperationException("Assunto do e-mail é obrigatório.");
        }

        await _emailSender.SendAsync(payload.To, payload.Subject, payload.Body, cancellationToken);

        _logger.LogInformation(
            "Job de e-mail concluído para {To} com assunto '{Subject}' (job {JobId})",
            payload.To,
            payload.Subject,
            job.Id);
    }

    internal record SendEmailPayload(string To, string Subject, string? Body);
}
