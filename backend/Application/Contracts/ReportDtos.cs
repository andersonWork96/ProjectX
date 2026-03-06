namespace ProjectX.Application.Contracts;

public record ReportItemDto(
    Guid Id,
    string InstallationCode,
    string CustomerName,
    string Notes,
    string Category,
    string OsNumber,
    string MeterCode,
    string Address,
    string Neighborhood,
    string City,
    string? SnLast6,
    string? MeterReading,
    string Status,
    string? LabelImageUrl,
    string? MeterImageUrl,
    string? DocumentUrl,
    DateTime CreatedAt
);

public record ImportExcelResultDto(int ImportedCount, int SkippedCount);
public record RegenerateReportRequest(string InstallationCode, string CustomerName, string SnLast6, string MeterReading);
