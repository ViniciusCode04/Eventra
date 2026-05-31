using JobProcessor.Domain.Enums;

namespace JobProcessor.Domain.Entities;

public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Type { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public JobStatus Status { get; set; } = JobStatus.Pendente;
    public int RetryCount { get; set; } = 0;
    public int MaxRetries { get; set; } = 3;
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? ReportFileName { get; set; }
    public string? ReportContentType { get; set; }
    public string? ReportDataBase64 { get; set; }
}
