using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using ClosedXML.Excel;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using A = DocumentFormat.OpenXml.Drawing;
using DW = DocumentFormat.OpenXml.Drawing.Wordprocessing;
using PIC = DocumentFormat.OpenXml.Drawing.Pictures;
using Microsoft.AspNetCore.Http;
using ProjectX.Application.Abstractions;
using ProjectX.Application.Contracts;

namespace ProjectX.Infrastructure.Services;

public class ReportAutomationService : IReportAutomationService
{
    private readonly string _storageRoot;
    private readonly string _imagesRoot;
    private readonly string _docsRoot;
    private readonly string _stateFile;
    private readonly string _tesseractExecutable;
    private readonly SemaphoreSlim _mutex = new(1, 1);

    public ReportAutomationService(IWebHostEnvironment env, IConfiguration config)
    {
        _storageRoot = Path.Combine(env.ContentRootPath, "Storage");
        _imagesRoot = Path.Combine(_storageRoot, "images");
        _docsRoot = Path.Combine(_storageRoot, "docs");
        _stateFile = Path.Combine(_storageRoot, "reports-state.json");
        _tesseractExecutable = ResolveTesseractExecutable(config);

        Directory.CreateDirectory(_storageRoot);
        Directory.CreateDirectory(_imagesRoot);
        Directory.CreateDirectory(_docsRoot);
    }

    public async Task<IReadOnlyCollection<ReportItemDto>> ListAsync()
    {
        await _mutex.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            return state.Items
                .OrderByDescending(x => x.CreatedAt)
                .Select(ToDto)
                .ToArray();
        }
        finally
        {
            _mutex.Release();
        }
    }

    public async Task<ImportExcelResultDto> ImportExcelAsync(IFormFile file)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException("Arquivo Excel vazio.");
        }

        await _mutex.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;

            using var workbook = new XLWorkbook(ms);
            var (ws, headerMap, firstDataRow, lastRow) = FindBestWorksheet(workbook);
            var required = new[] { "instalacao", "nome", "os", "medidor" };
            foreach (var req in required)
            {
                if (!headerMap.ContainsKey(req))
                {
                    throw new InvalidOperationException($"Coluna obrigatoria ausente: {req}.");
                }
            }

            var imported = 0;
            var skipped = 0;

            for (var rowNumber = firstDataRow; rowNumber <= lastRow; rowNumber++)
            {
                var row = ws.Row(rowNumber);
                var os = row.Cell(headerMap["os"]).GetString().Trim();
                if (string.IsNullOrWhiteSpace(os))
                {
                    continue;
                }

                var existing = state.Items.FirstOrDefault(x => x.OsNumber == os);
                if (existing is not null)
                {
                    existing.InstallationCode = row.Cell(headerMap["instalacao"]).GetString().Trim();
                    existing.CustomerName = row.Cell(headerMap["nome"]).GetString().Trim();
                    existing.Notes = ReadOptionalColumn(row, headerMap, "obs");
                    existing.Category = ReadOptionalColumn(row, headerMap, "categorizacao");
                    existing.MeterCode = row.Cell(headerMap["medidor"]).GetString().Trim();
                    existing.Address = ReadOptionalColumn(row, headerMap, "endereco");
                    existing.Neighborhood = ReadOptionalColumn(row, headerMap, "bairro");
                    existing.City = ReadOptionalColumn(row, headerMap, "cidade");
                    continue;
                }

                var item = new ReportItem
                {
                    Id = Guid.NewGuid(),
                    InstallationCode = row.Cell(headerMap["instalacao"]).GetString().Trim(),
                    CustomerName = row.Cell(headerMap["nome"]).GetString().Trim(),
                    Notes = ReadOptionalColumn(row, headerMap, "obs"),
                    Category = ReadOptionalColumn(row, headerMap, "categorizacao"),
                    OsNumber = os,
                    MeterCode = row.Cell(headerMap["medidor"]).GetString().Trim(),
                    Address = ReadOptionalColumn(row, headerMap, "endereco"),
                    Neighborhood = ReadOptionalColumn(row, headerMap, "bairro"),
                    City = ReadOptionalColumn(row, headerMap, "cidade"),
                    Status = "Aguardando imagens",
                    CreatedAt = DateTime.UtcNow
                };

                state.Items.Add(item);
                imported++;
            }

            await SaveStateAsync(state);
            return new ImportExcelResultDto(imported, skipped);
        }
        finally
        {
            _mutex.Release();
        }
    }

    public async Task UploadImagesAsync(Guid id, IFormFile labelImage, IFormFile meterImage)
    {
        await _mutex.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var item = state.Items.FirstOrDefault(x => x.Id == id)
                ?? throw new InvalidOperationException("Registro nao encontrado.");

            item.LabelImagePath = await SaveImageAsync(id, "label", labelImage);
            item.MeterImagePath = await SaveImageAsync(id, "meter", meterImage);
            item.Status = "Imagens recebidas";

            await SaveStateAsync(state);
        }
        finally
        {
            _mutex.Release();
        }
    }

    public async Task<ReportItemDto> ProcessAsync(Guid id)
    {
        await _mutex.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var item = state.Items.FirstOrDefault(x => x.Id == id)
                ?? throw new InvalidOperationException("Registro nao encontrado.");

            if (string.IsNullOrWhiteSpace(item.LabelImagePath) || string.IsNullOrWhiteSpace(item.MeterImagePath))
            {
                throw new InvalidOperationException("Envie as duas imagens antes de processar.");
            }

            await ProcessItemAsync(item, item.InstallationCode);

            await SaveStateAsync(state);
            return ToDto(item);
        }
        finally
        {
            _mutex.Release();
        }
    }

    public async Task<ReportItemDto> ProcessByInstallationAsync(
        string installationCode,
        IFormFile labelImage,
        IFormFile meterImage)
    {
        if (string.IsNullOrWhiteSpace(installationCode))
        {
            throw new InvalidOperationException("Informe o numero da instalacao.");
        }

        var normalized = installationCode.Trim();

        await _mutex.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var item = state.Items.FirstOrDefault(x =>
                string.Equals(x.InstallationCode, normalized, StringComparison.OrdinalIgnoreCase))
                ?? throw new InvalidOperationException("Instalacao nao encontrada na planilha importada.");

            item.LabelImagePath = await SaveImageAsync(item.Id, "label", labelImage);
            item.MeterImagePath = await SaveImageAsync(item.Id, "meter", meterImage);
            item.Status = "Imagens recebidas";

            await ProcessItemAsync(item, normalized);
            await SaveStateAsync(state);
            return ToDto(item);
        }
        finally
        {
            _mutex.Release();
        }
    }

    public async Task<ReportItemDto> RegenerateAsync(Guid id, RegenerateReportRequest request)
    {
        await _mutex.WaitAsync();
        try
        {
            var state = await LoadStateAsync();
            var item = state.Items.FirstOrDefault(x => x.Id == id)
                ?? throw new InvalidOperationException("Registro nao encontrado.");

            item.InstallationCode = (request.InstallationCode ?? string.Empty).Trim();
            item.CustomerName = (request.CustomerName ?? string.Empty).Trim();
            item.SnLast6 = (request.SnLast6 ?? string.Empty).Trim();
            item.MeterReading = (request.MeterReading ?? string.Empty).Trim();
            item.Status = "Processado (ajustado manualmente)";

            var docFile = $"{item.OsNumber}.docx";
            var docAbsolutePath = Path.Combine(_docsRoot, docFile);
            BuildWordDocument(item, docAbsolutePath);
            item.DocumentUrl = $"/docs/{docFile}";

            await SaveStateAsync(state);
            return ToDto(item);
        }
        finally
        {
            _mutex.Release();
        }
    }

    private async Task ProcessItemAsync(ReportItem item, string expectedInstallationCode)
    {
        if (string.IsNullOrWhiteSpace(item.LabelImagePath) || string.IsNullOrWhiteSpace(item.MeterImagePath))
        {
            throw new InvalidOperationException("Envie as duas imagens antes de processar.");
        }

        var labelText = await RunTesseractAsync(item.LabelImagePath, _tesseractExecutable);
        var labelTextSnFocused = await RunTesseractAsync(
            item.LabelImagePath,
            _tesseractExecutable,
            "--psm",
            "6",
            "-c",
            "tessedit_char_whitelist=SNsn:0123456789"
        );
        var labelTextSnSingleLine = await RunTesseractAsync(
            item.LabelImagePath,
            _tesseractExecutable,
            "--psm",
            "7",
            "-c",
            "tessedit_char_whitelist=SNsn:0123456789"
        );
        var labelTextDigitsOnly = await RunTesseractAsync(
            item.LabelImagePath,
            _tesseractExecutable,
            "--psm",
            "6",
            "-c",
            "tessedit_char_whitelist=0123456789"
        );
        var meterText = await RunTesseractAsync(
            item.MeterImagePath,
            _tesseractExecutable,
            "--psm",
            "6",
            "-c",
            "tessedit_char_whitelist=0123456789,."
        );
        var combinedText = $"{labelText}\n{meterText}";

        item.SnLast6 = ExtractSnLast6(
            $"{labelTextSnFocused}\n{labelTextSnSingleLine}\n{labelTextDigitsOnly}\n{labelText}"
        );
        item.MeterReading = ExtractMeterReading(meterText);

        var installationMatched = combinedText.Contains(expectedInstallationCode, StringComparison.OrdinalIgnoreCase);
        item.Status = installationMatched
            ? "Processado (instalacao confirmada na imagem)"
            : "Processado (sem confirmacao de instalacao na imagem)";

        var docFile = $"{item.OsNumber}.docx";
        var docAbsolutePath = Path.Combine(_docsRoot, docFile);
        BuildWordDocument(item, docAbsolutePath);
        item.DocumentUrl = $"/docs/{docFile}";
    }

    private async Task<AutomationState> LoadStateAsync()
    {
        if (!File.Exists(_stateFile))
        {
            return new AutomationState();
        }

        var json = await File.ReadAllTextAsync(_stateFile);
        if (string.IsNullOrWhiteSpace(json))
        {
            return new AutomationState();
        }

        return JsonSerializer.Deserialize<AutomationState>(json) ?? new AutomationState();
    }

    private async Task SaveStateAsync(AutomationState state)
    {
        var json = JsonSerializer.Serialize(state, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        await File.WriteAllTextAsync(_stateFile, json);
    }

    private static Dictionary<string, int> BuildHeaderMap(IXLRow headerRow)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var cell in headerRow.CellsUsed())
        {
            var key = NormalizeHeader(cell.GetString());
            if (!string.IsNullOrWhiteSpace(key))
            {
                map[key] = cell.Address.ColumnNumber;
            }
        }
        return map;
    }

    private static (IXLWorksheet ws, Dictionary<string, int> headerMap, int firstDataRow, int lastRow)
        FindBestWorksheet(XLWorkbook workbook)
    {
        foreach (var sheet in workbook.Worksheets)
        {
            var header = sheet.FirstRowUsed();
            if (header is null) continue;

            var map = BuildHeaderMap(header);
            if (!map.ContainsKey("instalacao") || !map.ContainsKey("nome") ||
                !map.ContainsKey("os") || !map.ContainsKey("medidor"))
            {
                continue;
            }

            var firstData = header.RowNumber() + 1;
            var lastData = sheet.LastRowUsed()?.RowNumber() ?? firstData;
            return (sheet, map, firstData, lastData);
        }

        throw new InvalidOperationException(
            "Nao foi encontrada uma aba com os cabecalhos: Instalacao, Nome, OS e Medidor.");
    }

    private static string NormalizeHeader(string header)
    {
        var normalized = header.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(c);
            }
        }

        return sb.ToString()
            .Replace(" ", string.Empty)
            .Replace("(", string.Empty)
            .Replace(")", string.Empty)
            .Replace("-", string.Empty);
    }

    private static string ReadOptionalColumn(IXLRow row, Dictionary<string, int> headerMap, string headerKey)
    {
        var column = headerMap
            .FirstOrDefault(x => x.Key.Contains(headerKey, StringComparison.OrdinalIgnoreCase))
            .Value;

        return column > 0 ? row.Cell(column).GetString().Trim() : string.Empty;
    }

    private async Task<string> SaveImageAsync(Guid id, string slot, IFormFile file)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException("Imagem vazia.");
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = ".jpg";
        }

        var fileName = $"{id}_{slot}{ext}";
        var absolute = Path.Combine(_imagesRoot, fileName);
        await using var stream = File.Create(absolute);
        await file.CopyToAsync(stream);
        return absolute;
    }

    private static async Task<string> RunTesseractAsync(
        string imagePath,
        string executablePath,
        params string[] extraArgs)
    {
        var psi = new ProcessStartInfo
        {
            FileName = executablePath,
            RedirectStandardError = true,
            RedirectStandardOutput = true,
            UseShellExecute = false
        };
        psi.ArgumentList.Add(imagePath);
        psi.ArgumentList.Add("stdout");
        psi.ArgumentList.Add("-l");
        psi.ArgumentList.Add("por+eng");
        foreach (var arg in extraArgs)
        {
            psi.ArgumentList.Add(arg);
        }

        Process? process;
        try
        {
            process = Process.Start(psi);
        }
        catch (Exception)
        {
            throw new InvalidOperationException(
                "OCR indisponivel. Instale o Tesseract OCR e adicione no PATH, " +
                "ou configure a chave Tesseract:Path no appsettings.Development.json.");
        }

        if (process is null)
        {
            throw new InvalidOperationException("Nao foi possivel iniciar o OCR.");
        }

        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException(
                $"Erro no OCR. Instale o Tesseract e configure no PATH. Detalhe: {error}");
        }

        return output;
    }

    private static string ExtractSnLast6(string text)
    {
        var normalized = text
            .Replace('\r', '\n')
            .Replace('O', '0')
            .Replace('o', '0')
            .Replace('I', '1')
            .Replace('l', '1');

        var snRegexNear = Regex.Match(
            normalized,
            @"(?is)\bS\W*N\W*[:\-]?\W*([0-9\s\-\.:]{6,50})");
        if (snRegexNear.Success)
        {
            var digitsNear = new string(snRegexNear.Groups[1].Value.Where(char.IsDigit).ToArray());
            if (digitsNear.Length >= 6)
            {
                return digitsNear[^6..];
            }
        }

        var snIndex = normalized.IndexOf("SN", StringComparison.OrdinalIgnoreCase);
        if (snIndex >= 0)
        {
            var snWindowLength = Math.Min(90, normalized.Length - snIndex);
            var snWindow = normalized.Substring(snIndex, snWindowLength);
            var snDigits = new string(snWindow.Where(char.IsDigit).ToArray());
            if (snDigits.Length >= 6)
            {
                return snDigits[^6..];
            }
        }

        var lines = normalized
            .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        for (var i = 0; i < lines.Length; i++)
        {
            if (!Regex.IsMatch(lines[i], @"\bS\s*N\b", RegexOptions.IgnoreCase))
            {
                continue;
            }

            var currentDigits = new string(lines[i].Where(char.IsDigit).ToArray());
            var nextDigits = i + 1 < lines.Length
                ? new string(lines[i + 1].Where(char.IsDigit).ToArray())
                : string.Empty;

            var candidate = currentDigits.Length >= nextDigits.Length ? currentDigits : nextDigits;
            if (candidate.Length >= 6)
            {
                return candidate[^6..];
            }
        }

        var snRegex = Regex.Match(
            normalized,
            @"(?i)S\s*N[^0-9]{0,12}([0-9][0-9\s]{5,30})");
        if (snRegex.Success)
        {
            var digits = new string(snRegex.Groups[1].Value.Where(char.IsDigit).ToArray());
            if (digits.Length >= 6)
            {
                return digits[^6..];
            }
        }

        // fallback: usa o maior bloco numerico (serial tende a ter >= 14 digitos)
        var candidates = Regex.Matches(normalized, @"(?:\d[\s\-\.:]*){8,}")
            .Select(x => new string(x.Value.Where(char.IsDigit).ToArray()))
            .Where(x => x.Length >= 8)
            .Distinct()
            .OrderByDescending(x => x.Length)
            .ToList();

        var preferred = candidates.FirstOrDefault(x => x.Length >= 14)
            ?? candidates.FirstOrDefault(x => x.Length >= 10)
            ?? candidates.FirstOrDefault();

        return !string.IsNullOrWhiteSpace(preferred) && preferred.Length >= 6
            ? preferred[^6..]
            : string.Empty;
    }

    private static string ResolveTesseractExecutable(IConfiguration config)
    {
        var configured = config["Tesseract:Path"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured;
        }

        var envPath = Environment.GetEnvironmentVariable("TESSERACT_PATH");
        if (!string.IsNullOrWhiteSpace(envPath))
        {
            return envPath;
        }

        var defaultPaths = new[]
        {
            @"C:\Program Files\Tesseract-OCR\tesseract.exe",
            @"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        };

        foreach (var path in defaultPaths)
        {
            if (File.Exists(path))
            {
                return path;
            }
        }

        return "tesseract";
    }

    private static string ExtractMeterReading(string text)
    {
        var compact = text.Replace(" ", string.Empty);
        var commaMatches = Regex.Matches(compact, @"\d{1,8}[,\.]\d{1,3}")
            .Select(x => x.Value)
            .OrderByDescending(x => x.Length)
            .ToList();

        if (commaMatches.Count > 0)
        {
            return commaMatches[0].Replace('.', ',');
        }

        var rawDigits = Regex.Matches(compact, @"\d{5,10}")
            .Select(x => x.Value)
            .OrderByDescending(x => x.Length)
            .FirstOrDefault();

        if (string.IsNullOrWhiteSpace(rawDigits))
        {
            return string.Empty;
        }

        if (rawDigits.Length <= 2)
        {
            return rawDigits;
        }

        var intPart = rawDigits[..^2].TrimStart('0');
        if (string.IsNullOrWhiteSpace(intPart))
        {
            intPart = "0";
        }

        return $"{intPart},{rawDigits[^2..]}";
    }

    private static void BuildWordDocument(ReportItem item, string outputPath)
    {
        using var wordDocument =
            WordprocessingDocument.Create(outputPath, WordprocessingDocumentType.Document);

        var mainPart = wordDocument.AddMainDocumentPart();
        mainPart.Document = new Document(new Body());
        var body = mainPart.Document.Body!;

        AppendText(body, $"Codigo de instalacao: {item.InstallationCode}");
        AppendText(body, $"Cliente: {item.CustomerName}");
        AppendText(body, $"SN: {item.SnLast6}");
        AppendText(body, $"Leitura: {item.MeterReading}");
        AppendText(body, string.Empty);

        if (!string.IsNullOrWhiteSpace(item.LabelImagePath) && File.Exists(item.LabelImagePath))
        {
            AppendText(body, "Imagem 1 (etiqueta):", true);
            AppendImage(mainPart, body, item.LabelImagePath, 350, 350);
        }

        if (!string.IsNullOrWhiteSpace(item.MeterImagePath) && File.Exists(item.MeterImagePath))
        {
            AppendText(body, "Imagem 2 (medidor):", true);
            AppendImage(mainPart, body, item.MeterImagePath, 350, 350);
        }

        mainPart.Document.Save();
    }

    private static void AppendText(Body body, string text, bool bold = false)
    {
        var run = new Run(new Text(text ?? string.Empty) { Space = SpaceProcessingModeValues.Preserve });
        if (bold)
        {
            run.RunProperties = new RunProperties(new Bold());
        }

        body.Append(new Paragraph(run));
    }

    private static void AppendImage(
        MainDocumentPart mainPart,
        Body body,
        string imagePath,
        int widthPx,
        int heightPx)
    {
        var contentType = GetImageContentType(imagePath);
        var imagePart = mainPart.AddImagePart(contentType);
        using (var stream = File.OpenRead(imagePath))
        {
            imagePart.FeedData(stream);
        }

        var relationshipId = mainPart.GetIdOfPart(imagePart);
        var emuPerPixel = 9525L;
        var cx = widthPx * emuPerPixel;
        var cy = heightPx * emuPerPixel;

        var element = new Drawing(
            new DW.Inline(
                new DW.Extent { Cx = cx, Cy = cy },
                new DW.EffectExtent
                {
                    LeftEdge = 0L,
                    TopEdge = 0L,
                    RightEdge = 0L,
                    BottomEdge = 0L
                },
                new DW.DocProperties { Id = (UInt32Value)1U, Name = "Image" },
                new DW.NonVisualGraphicFrameDrawingProperties(
                    new A.GraphicFrameLocks { NoChangeAspect = true }),
                new A.Graphic(
                    new A.GraphicData(
                        new PIC.Picture(
                            new PIC.NonVisualPictureProperties(
                                new PIC.NonVisualDrawingProperties { Id = (UInt32Value)0U, Name = Path.GetFileName(imagePath) },
                                new PIC.NonVisualPictureDrawingProperties()),
                            new PIC.BlipFill(
                                new A.Blip { Embed = relationshipId, CompressionState = A.BlipCompressionValues.Print },
                                new A.Stretch(new A.FillRectangle())),
                            new PIC.ShapeProperties(
                                new A.Transform2D(
                                    new A.Offset { X = 0L, Y = 0L },
                                    new A.Extents { Cx = cx, Cy = cy }),
                                new A.PresetGeometry(new A.AdjustValueList())
                                { Preset = A.ShapeTypeValues.Rectangle }))
                    )
                    { Uri = "http://schemas.openxmlformats.org/drawingml/2006/picture" }))
            {
                DistanceFromTop = (UInt32Value)0U,
                DistanceFromBottom = (UInt32Value)0U,
                DistanceFromLeft = (UInt32Value)0U,
                DistanceFromRight = (UInt32Value)0U
            });

        body.Append(new Paragraph(new Run(element)));
    }

    private static string GetImageContentType(string imagePath)
    {
        var ext = Path.GetExtension(imagePath).ToLowerInvariant();
        return ext switch
        {
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".bmp" => "image/bmp",
            ".tif" => "image/tiff",
            ".tiff" => "image/tiff",
            _ => "image/jpeg"
        };
    }

    private static ReportItemDto ToDto(ReportItem item) =>
        new(
            item.Id,
            item.InstallationCode,
            item.CustomerName,
            item.Notes,
            item.Category,
            item.OsNumber,
            item.MeterCode,
            item.Address,
            item.Neighborhood,
            item.City,
            item.SnLast6,
            item.MeterReading,
            item.Status,
            ToPublicImageUrl(item.LabelImagePath),
            ToPublicImageUrl(item.MeterImagePath),
            item.DocumentUrl,
            item.CreatedAt
        );

    private static string? ToPublicImageUrl(string? absolutePath)
    {
        if (string.IsNullOrWhiteSpace(absolutePath))
        {
            return null;
        }

        var fileName = Path.GetFileName(absolutePath);
        return string.IsNullOrWhiteSpace(fileName) ? null : $"/images/{fileName}";
    }

    private sealed class AutomationState
    {
        public List<ReportItem> Items { get; set; } = [];
    }

    private sealed class ReportItem
    {
        public Guid Id { get; set; }
        public string InstallationCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string OsNumber { get; set; } = string.Empty;
        public string MeterCode { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Neighborhood { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? LabelImagePath { get; set; }
        public string? MeterImagePath { get; set; }
        public string? SnLast6 { get; set; }
        public string? MeterReading { get; set; }
        public string? DocumentUrl { get; set; }
        public string Status { get; set; } = "Aguardando imagens";
        public DateTime CreatedAt { get; set; }
    }
}
