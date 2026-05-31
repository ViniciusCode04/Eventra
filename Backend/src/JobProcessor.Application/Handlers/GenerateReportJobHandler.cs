using System.Text.Json;
using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace JobProcessor.Application.Handlers;

public class GenerateReportJobHandler : IJobHandler
{
    private readonly IReportGenerator _reportGenerator;
    private readonly ILogger<GenerateReportJobHandler> _logger;

    public GenerateReportJobHandler(
        IReportGenerator reportGenerator,
        ILogger<GenerateReportJobHandler> logger)
    {
        _reportGenerator = reportGenerator;
        _logger = logger;
    }

    public string JobType => JobTypes.GenerateReport;

    public async Task HandleAsync(Job job, CancellationToken cancellationToken = default)
    {
        var payload = JsonSerializer.Deserialize<GenerateReportPayload>(job.Payload, JobPayloadJson.Options)
            ?? throw new InvalidOperationException("Payload de relatório inválido.");

        if (string.IsNullOrWhiteSpace(payload.ReportName))
        {
            throw new InvalidOperationException("Nome do relatório é obrigatório.");
        }

        var format = string.IsNullOrWhiteSpace(payload.Format) ? "pdf" : payload.Format.Trim().ToLowerInvariant();

        var report = await _reportGenerator.GenerateAsync(
            payload.ReportName,
            format,
            job.Id,
            cancellationToken);

        job.ReportFileName = report.FileName;
        job.ReportContentType = report.ContentType;
        job.ReportDataBase64 = Convert.ToBase64String(report.Data);

        _logger.LogInformation(
            "Relatório {FileName} gerado ({Size} bytes) para job {JobId}",
            report.FileName,
            report.Data.Length,
            job.Id);
    }

    internal record GenerateReportPayload(string ReportName, string? Format);
}
