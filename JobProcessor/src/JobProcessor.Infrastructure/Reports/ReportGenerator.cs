using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using JobProcessor.Application.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JobProcessor.Infrastructure.Reports;

public class ReportGenerator : IReportGenerator
{
    static ReportGenerator()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public Task<GeneratedReport> GenerateAsync(
        string reportName,
        string format,
        Guid jobId,
        CancellationToken cancellationToken = default)
    {
        var rows = BuildSampleRows(reportName);
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss", CultureInfo.InvariantCulture);
        var safeName = SanitizeFileName(reportName);

        return format switch
        {
            "csv" => Task.FromResult(GenerateCsv(safeName, timestamp, jobId, rows)),
            "excel" or "xlsx" or "xls" => Task.FromResult(GenerateExcel(safeName, timestamp, jobId, rows)),
            "pdf" or _ => Task.FromResult(GeneratePdf(safeName, timestamp, jobId, reportName, rows)),
        };
    }

    private static GeneratedReport GenerateCsv(
        string safeName,
        string timestamp,
        Guid jobId,
        IReadOnlyList<ReportRow> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Relatório,Gerado por Eventra / JobProcessor");
        sb.AppendLine($"Nome,{safeName}");
        sb.AppendLine($"Job ID,{jobId}");
        sb.AppendLine($"Gerado em,{DateTime.UtcNow:O}");
        sb.AppendLine();
        sb.AppendLine("Categoria,Descrição,Quantidade,Valor (R$)");

        foreach (var row in rows)
        {
            sb.AppendLine($"{EscapeCsv(row.Category)},{EscapeCsv(row.Description)},{row.Quantity},{row.Value.ToString("F2", CultureInfo.InvariantCulture)}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return new GeneratedReport(
            $"{safeName}_{timestamp}.csv",
            "text/csv",
            bytes);
    }

    private static GeneratedReport GenerateExcel(
        string safeName,
        string timestamp,
        Guid jobId,
        IReadOnlyList<ReportRow> rows)
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Relatório");

        sheet.Cell(1, 1).Value = "Relatório Eventra";
        sheet.Cell(2, 1).Value = "Nome:";
        sheet.Cell(2, 2).Value = safeName;
        sheet.Cell(3, 1).Value = "Job ID:";
        sheet.Cell(3, 2).Value = jobId.ToString();
        sheet.Cell(4, 1).Value = "Gerado em:";
        sheet.Cell(4, 2).Value = DateTime.UtcNow.ToString("g", CultureInfo.GetCultureInfo("pt-BR"));

        var headerRow = 6;
        sheet.Cell(headerRow, 1).Value = "Categoria";
        sheet.Cell(headerRow, 2).Value = "Descrição";
        sheet.Cell(headerRow, 3).Value = "Quantidade";
        sheet.Cell(headerRow, 4).Value = "Valor (R$)";
        sheet.Range(headerRow, 1, headerRow, 4).Style.Font.Bold = true;
        sheet.Range(headerRow, 1, headerRow, 4).Style.Fill.BackgroundColor = XLColor.FromHtml("#00D4FF");

        var rowIndex = headerRow + 1;
        foreach (var row in rows)
        {
            sheet.Cell(rowIndex, 1).Value = row.Category;
            sheet.Cell(rowIndex, 2).Value = row.Description;
            sheet.Cell(rowIndex, 3).Value = row.Quantity;
            sheet.Cell(rowIndex, 4).Value = row.Value;
            rowIndex++;
        }

        sheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new GeneratedReport(
            $"{safeName}_{timestamp}.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            stream.ToArray());
    }

    private static GeneratedReport GeneratePdf(
        string safeName,
        string timestamp,
        Guid jobId,
        string reportTitle,
        IReadOnlyList<ReportRow> rows)
    {
        var bytes = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(column =>
                {
                    column.Item().Text("EVENTRA — Relatório").Bold().FontSize(18).FontColor(Colors.Cyan.Medium);
                    column.Item().Text(reportTitle).SemiBold().FontSize(14);
                    column.Item().PaddingTop(6).Text(text =>
                    {
                        text.Span("Job: ").SemiBold();
                        text.Span(jobId.ToString());
                        text.Span("  |  Gerado: ").SemiBold();
                        text.Span(DateTime.UtcNow.ToString("g", CultureInfo.GetCultureInfo("pt-BR")));
                    });
                });

                page.Content().PaddingVertical(20).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(3);
                        columns.RelativeColumn(1);
                        columns.RelativeColumn(1.5f);
                    });

                    table.Header(header =>
                    {
                        header.Cell().Background(Colors.Cyan.Medium).Padding(5).Text("Categoria").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Cyan.Medium).Padding(5).Text("Descrição").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Cyan.Medium).Padding(5).Text("Qtd").FontColor(Colors.White).Bold();
                        header.Cell().Background(Colors.Cyan.Medium).Padding(5).Text("Valor (R$)").FontColor(Colors.White).Bold();
                    });

                    foreach (var row in rows)
                    {
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(row.Category);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(row.Description);
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(row.Quantity.ToString());
                        table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Text(row.Value.ToString("N2", CultureInfo.GetCultureInfo("pt-BR")));
                    }
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Gerado automaticamente pelo JobProcessor · ");
                    x.CurrentPageNumber();
                    x.Span(" / ");
                    x.TotalPages();
                });
            });
        }).GeneratePdf();

        return new GeneratedReport(
            $"{safeName}_{timestamp}.pdf",
            "application/pdf",
            bytes);
    }

    private static List<ReportRow> BuildSampleRows(string reportName)
    {
        var seed = reportName.GetHashCode(StringComparison.OrdinalIgnoreCase);
        var random = new Random(seed);

        return Enumerable.Range(1, 8).Select(i => new ReportRow(
            Category: $"CAT-{i:D2}",
            Description: $"{reportName} — linha {i}",
            Quantity: random.Next(10, 500),
            Value: Math.Round((decimal)(random.NextDouble() * 5000 + 100), 2))).ToList();
    }

    private static string SanitizeFileName(string name)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var sanitized = new string(name.Select(c => invalid.Contains(c) ? '_' : c).ToArray());
        return string.IsNullOrWhiteSpace(sanitized) ? "relatorio" : sanitized.Replace(' ', '_');
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains('"') || value.Contains(',') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }

    private record ReportRow(string Category, string Description, int Quantity, decimal Value);
}
