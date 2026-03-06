using Microsoft.AspNetCore.Mvc;
using ProjectX.Application.Abstractions;
using ProjectX.Application.Contracts;

namespace ProjectX.Api.Controllers;

[ApiController]
[Route("reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportAutomationService _service;

    public ReportsController(IReportAutomationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<object>> List()
    {
        var items = await _service.ListAsync();
        return Ok(items);
    }

    [HttpPost("import-excel")]
    public async Task<ActionResult<object>> ImportExcel([FromForm] IFormFile file)
    {
        try
        {
            var result = await _service.ImportExcelAsync(file);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/images")]
    public async Task<ActionResult<object>> UploadImages(
        [FromRoute] Guid id,
        [FromForm] IFormFile labelImage,
        [FromForm] IFormFile meterImage)
    {
        try
        {
            await _service.UploadImagesAsync(id, labelImage, meterImage);
            return Ok(new { message = "Imagens recebidas." });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/process")]
    public async Task<ActionResult<object>> Process([FromRoute] Guid id)
    {
        try
        {
            var item = await _service.ProcessAsync(id);
            return Ok(item);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("process-by-installation")]
    public async Task<ActionResult<object>> ProcessByInstallation(
        [FromForm] string installationCode,
        [FromForm] IFormFile labelImage,
        [FromForm] IFormFile meterImage)
    {
        try
        {
            var item = await _service.ProcessByInstallationAsync(installationCode, labelImage, meterImage);
            return Ok(item);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id:guid}/regenerate")]
    public async Task<ActionResult<object>> Regenerate([FromRoute] Guid id, [FromBody] RegenerateReportRequest request)
    {
        try
        {
            var item = await _service.RegenerateAsync(id, request);
            return Ok(item);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
