using System.Text.Json;
using JobProcessor.Application;
using JobProcessor.Application.Handlers;
using JobProcessor.Application.Interfaces;
using JobProcessor.Application.Services;
using JobProcessor.Domain.Entities;
using Microsoft.Extensions.Logging.Abstractions;

namespace JobProcessor.Application.Tests.Services;

public class JobExecutorTests
{
    private readonly JobExecutor _executor;

    public JobExecutorTests()
    {
        IJobHandler[] handlers =
        [
            new SendEmailJobHandler(new NoOpEmailSender(), NullLogger<SendEmailJobHandler>.Instance),
            new GenerateReportJobHandler(new StubReportGenerator(), NullLogger<GenerateReportJobHandler>.Instance)
        ];

        _executor = new JobExecutor(handlers);
    }

    [Theory]
    [InlineData(JobTypes.SendEmail)]
    [InlineData(JobTypes.GenerateReport)]
    public async Task ExecuteAsync_WithKnownJobType_DispatchesToHandler(string jobType)
    {
        var job = CreateJob(jobType);

        var exception = await Record.ExceptionAsync(() => _executor.ExecuteAsync(job));

        Assert.Null(exception);
    }

    [Fact]
    public async Task ExecuteAsync_WithUnknownJobType_ThrowsInvalidOperationException()
    {
        var job = new Job
        {
            Type = "UnknownType",
            Payload = "{}"
        };

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _executor.ExecuteAsync(job));

        Assert.Contains("Nenhum handler registrado", exception.Message);
    }

    [Fact]
    public async Task ExecuteAsync_IsCaseInsensitiveForJobType()
    {
        var job = new Job
        {
            Type = "enviaremail",
            Payload = JsonSerializer.Serialize(new { to = "a@b.com", subject = "Hi" })
        };

        var exception = await Record.ExceptionAsync(() => _executor.ExecuteAsync(job));

        Assert.Null(exception);
    }

    private static Job CreateJob(string type) => type switch
    {
        JobTypes.SendEmail => new Job
        {
            Type = type,
            Payload = JsonSerializer.Serialize(new { to = "user@email.com", subject = "Test" })
        },
        JobTypes.GenerateReport => new Job
        {
            Type = type,
            Payload = JsonSerializer.Serialize(new { reportName = "Report" })
        },
        _ => new Job { Type = type, Payload = "{}" }
    };

    private sealed class NoOpEmailSender : IEmailSender
    {
        public Task SendAsync(string to, string subject, string? body, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }

    private sealed class StubReportGenerator : IReportGenerator
    {
        public Task<GeneratedReport> GenerateAsync(
            string reportName,
            string format,
            Guid jobId,
            CancellationToken cancellationToken = default)
            => Task.FromResult(new GeneratedReport("test.pdf", "application/pdf", [1, 2, 3]));
    }
}
