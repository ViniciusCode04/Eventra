using System.Text.Json;

using JobProcessor.API.DTOs;

using JobProcessor.Application;

using JobProcessor.Application.Services;

using JobProcessor.Domain.Entities;

using Microsoft.AspNetCore.Mvc;



namespace JobProcessor.API.Controllers;



[ApiController]

[Route("api/jobs")]

public class JobsController : ControllerBase

{

    private readonly JobService _jobService;

    private readonly ILogger<JobsController> _logger;



    public JobsController(JobService jobService, ILogger<JobsController> logger)

    {

        _jobService = jobService;

        _logger = logger;

    }



    [HttpPost]

    public async Task<ActionResult<JobResponse>> CreateJob(

        [FromBody] CreateJobRequest request,

        CancellationToken cancellationToken)

    {

        if (string.IsNullOrWhiteSpace(request.Type))

        {

            return BadRequest(new { error = "O tipo é obrigatório e não pode estar vazio." });

        }



        var payloadJson = request.Payload.GetRawText();

        var job = await _jobService.CreateJobAsync(request.Type, payloadJson, cancellationToken);



        _logger.LogInformation("Job {JobId} criado via API", job.Id);



        return CreatedAtAction(nameof(GetJobById), new { id = job.Id }, MapToResponse(job));

    }



    [HttpGet("{id:guid}")]

    public async Task<ActionResult<JobResponse>> GetJobById(Guid id, CancellationToken cancellationToken)

    {

        var job = await _jobService.GetJobAsync(id, cancellationToken);



        if (job is null)

        {

            return NotFound(new { error = $"Job {id} não encontrado." });

        }



        return Ok(MapToResponse(job));

    }



    [HttpGet("{id:guid}/report")]

    public async Task<IActionResult> DownloadReport(Guid id, CancellationToken cancellationToken)

    {

        var job = await _jobService.GetJobAsync(id, cancellationToken);



        if (job is null)

        {

            return NotFound(new { error = $"Job {id} não encontrado." });

        }



        if (!string.Equals(job.Type, JobTypes.GenerateReport, StringComparison.OrdinalIgnoreCase))

        {

            return BadRequest(new { error = "Este job não é do tipo GerarRelatorio." });

        }



        if (job.Status != Domain.Enums.JobStatus.Concluido || string.IsNullOrEmpty(job.ReportDataBase64))

        {

            return NotFound(new { error = "Relatório ainda não disponível. Aguarde a conclusão do job." });

        }



        byte[] fileBytes;

        try

        {

            fileBytes = Convert.FromBase64String(job.ReportDataBase64);

        }

        catch (FormatException)

        {

            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "Arquivo de relatório corrompido." });

        }



        var fileName = job.ReportFileName ?? "relatorio.bin";

        var contentType = job.ReportContentType ?? "application/octet-stream";



        _logger.LogInformation("Download do relatório {FileName} para job {JobId}", fileName, id);



        return File(fileBytes, contentType, fileName);

    }



    [HttpGet]

    public async Task<ActionResult<IEnumerable<JobResponse>>> GetAllJobs(CancellationToken cancellationToken)

    {

        var jobs = await _jobService.GetAllJobsAsync(cancellationToken);

        return Ok(jobs.Select(MapToResponse));

    }



    private static JobResponse MapToResponse(Job job)

    {

        return new JobResponse(

            job.Id,

            job.Type,

            job.Status.ToString(),

            job.RetryCount,

            job.ErrorMessage,

            job.CreatedAt,

            job.UpdatedAt,

            HasReport: !string.IsNullOrEmpty(job.ReportDataBase64),

            ReportFileName: job.ReportFileName);

    }

}


