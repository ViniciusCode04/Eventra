namespace JobProcessor.API.DTOs;

public record JobResponse(
    Guid Id,
    string Type,
    string Status,
    int RetryCount,
    string? ErrorMessage,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    bool HasReport,
    string? ReportFileName
);
