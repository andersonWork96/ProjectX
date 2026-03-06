using Microsoft.AspNetCore.Http;
using ProjectX.Application.Contracts;

namespace ProjectX.Application.Abstractions;

public interface IReportAutomationService
{
    Task<IReadOnlyCollection<ReportItemDto>> ListAsync();
    Task<ImportExcelResultDto> ImportExcelAsync(IFormFile file);
    Task UploadImagesAsync(Guid id, IFormFile labelImage, IFormFile meterImage);
    Task<ReportItemDto> ProcessAsync(Guid id);
    Task<ReportItemDto> ProcessByInstallationAsync(
        string installationCode,
        IFormFile labelImage,
        IFormFile meterImage
    );
    Task<ReportItemDto> RegenerateAsync(Guid id, RegenerateReportRequest request);
}
