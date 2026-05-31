using System.Text;
using JobProcessor.Application.Interfaces;
using JobProcessor.Application.Services;
using JobProcessor.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace JobProcessor.Infrastructure.Messaging;

public class RabbitMQConsumer : BackgroundService
{
    private const string QueueName = "job-queue";

    private readonly IConnection _connection;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RabbitMQConsumer> _logger;
    private IModel? _channel;
    private CancellationToken _stoppingToken;

    public RabbitMQConsumer(
        IConnection connection,
        IServiceScopeFactory scopeFactory,
        ILogger<RabbitMQConsumer> logger)
    {
        _connection = connection;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _stoppingToken = stoppingToken;
        _channel = _connection.CreateModel();

        _channel.QueueDeclare(
            queue: QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null);

        _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.Received += OnMessageReceivedAsync;

        _channel.BasicConsume(
            queue: QueueName,
            autoAck: false,
            consumer: consumer);

        _logger.LogInformation("Consumidor RabbitMQ iniciado na fila {QueueName}", QueueName);

        return Task.CompletedTask;
    }

    private async Task OnMessageReceivedAsync(object sender, BasicDeliverEventArgs eventArgs)
    {
        var jobIdText = Encoding.UTF8.GetString(eventArgs.Body.ToArray());

        if (!Guid.TryParse(jobIdText, out var jobId))
        {
            _logger.LogWarning("Mensagem recebida com id de job inválido: {Message}", jobIdText);
            _channel?.BasicAck(eventArgs.DeliveryTag, multiple: false);
            return;
        }

        try
        {
            await ProcessJobAsync(jobId, _stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao processar mensagem do job {JobId}", jobId);
        }
        finally
        {
            _channel?.BasicAck(eventArgs.DeliveryTag, multiple: false);
        }
    }

    private async Task ProcessJobAsync(Guid jobId, CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var jobRepository = scope.ServiceProvider.GetRequiredService<IJobRepository>();
        var jobQueuePublisher = scope.ServiceProvider.GetRequiredService<IJobQueuePublisher>();
        var jobExecutor = scope.ServiceProvider.GetRequiredService<JobExecutor>();

        var job = await jobRepository.TryAcquireAsync(jobId, cancellationToken);
        if (job is null)
        {
            _logger.LogInformation("Job {JobId} já adquirido por outro worker, ignorando", jobId);
            return;
        }

        try
        {
            _logger.LogInformation(
                "Processando job {JobId} do tipo {JobType} (tentativa {RetryCount})",
                job.Id,
                job.Type,
                job.RetryCount + 1);

            await jobExecutor.ExecuteAsync(job, cancellationToken);

            job.Status = JobStatus.Concluido;
            job.ErrorMessage = null;
            await jobRepository.UpdateAsync(job, cancellationToken);

            _logger.LogInformation("Job {JobId} concluído com sucesso", job.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Job {JobId} falhou durante o processamento", job.Id);

            job.RetryCount++;

            if (job.RetryCount < job.MaxRetries)
            {
                job.Status = JobStatus.Pendente;
                job.ErrorMessage = ex.Message;
                await jobRepository.UpdateAsync(job, cancellationToken);

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
                await jobQueuePublisher.PublishAsync(job.Id, cancellationToken);

                _logger.LogWarning(
                    "Job {JobId} agendado para nova tentativa {RetryCount}/{MaxRetries}",
                    job.Id,
                    job.RetryCount,
                    job.MaxRetries);
            }
            else
            {
                job.Status = JobStatus.Erro;
                job.ErrorMessage = ex.Message;
                await jobRepository.UpdateAsync(job, cancellationToken);

                _logger.LogError("Job {JobId} falhou permanentemente após {MaxRetries} tentativas", job.Id, job.MaxRetries);
            }
        }
    }

    public override void Dispose()
    {
        _channel?.Close();
        _channel?.Dispose();
        base.Dispose();
    }
}
