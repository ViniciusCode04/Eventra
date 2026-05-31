using System.Text.Json;
using JobProcessor.Application;
using JobProcessor.Application.Handlers;
using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;
using Microsoft.Extensions.Logging.Abstractions;

namespace JobProcessor.Application.Tests.Handlers;

public class GenerateReportJobHandlerTests
{
    private readonly GenerateReportJobHandler _handler = new(
        new FakeReportGenerator(),
        NullLogger<GenerateReportJobHandler>.Instance);

    [Fact]
    public async Task HandleAsync_WithValidPayload_GeneratesReportOnJob()
    {
        var job = CreateJob(new { reportName = "SalesSummary", format = "pdf" });

        await _handler.HandleAsync(job);

        Assert.True(job.HasReportData());
        Assert.Equal("SalesSummary_test.pdf", job.ReportFileName);
        Assert.Equal("application/pdf", job.ReportContentType);
    }

    [Fact]
    public async Task HandleAsync_WithoutFormat_UsesPdfAsDefault()
    {
        var job = CreateJob(new { reportName = "MonthlyReport" });

        await _handler.HandleAsync(job);

        Assert.True(job.HasReportData());
        Assert.EndsWith(".pdf", job.ReportFileName);
    }

    [Fact]
    public async Task HandleAsync_WithEmptyReportName_ThrowsInvalidOperationException()
    {
        var job = new Job
        {
            Type = JobTypes.GenerateReport,
            Payload = "{\"reportName\":\"\"}"
        };

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _handler.HandleAsync(job));

        Assert.Contains("relatório", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task HandleAsync_WithInvalidJson_ThrowsJsonException()
    {
        var job = new Job
        {
            Type = JobTypes.GenerateReport,
            Payload = "invalid"
        };

        await Assert.ThrowsAsync<JsonException>(() => _handler.HandleAsync(job));
    }

    private static Job CreateJob(object payload) => new()
    {
        Id = Guid.NewGuid(),
        Type = JobTypes.GenerateReport,
        Payload = JsonSerializer.Serialize(payload)
    };

    private sealed class FakeReportGenerator : IReportGenerator
    {
        public Task<GeneratedReport> GenerateAsync(
            string reportName,
            string format,
            Guid jobId,
            CancellationToken cancellationToken = default)
        {
            var ext = format == "csv" ? "csv" : format is "excel" or "xlsx" ? "xlsx" : "pdf";
            return Task.FromResult(new GeneratedReport(
                $"{reportName}_test.{ext}",
                "application/pdf",
                [0x25, 0x50, 0x44, 0x46]));
        }
    }
}

internal static class JobReportExtensions
{
    public static bool HasReportData(this Job job) =>
        !string.IsNullOrEmpty(job.ReportDataBase64);
}
