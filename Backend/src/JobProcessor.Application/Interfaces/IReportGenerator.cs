namespace JobProcessor.Application.Interfaces;

public interface IReportGenerator
{
    Task<GeneratedReport> GenerateAsync(
        string reportName,
        string format,
        Guid jobId,
        CancellationToken cancellationToken = default);
}

public record GeneratedReport(
    string FileName,
    string ContentType,
    byte[] Data);
