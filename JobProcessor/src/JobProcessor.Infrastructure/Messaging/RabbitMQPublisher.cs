using System.Text;
using JobProcessor.Application.Interfaces;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace JobProcessor.Infrastructure.Messaging;

public class RabbitMQPublisher : IJobQueuePublisher
{
    private const string QueueName = "job-queue";

    private readonly IConnection _connection;
    private readonly ILogger<RabbitMQPublisher> _logger;

    public RabbitMQPublisher(IConnection connection, ILogger<RabbitMQPublisher> logger)
    {
        _connection = connection;
        _logger = logger;
    }

    public Task PublishAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        using var channel = _connection.CreateModel();

        channel.QueueDeclare(
            queue: QueueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null);

        var body = Encoding.UTF8.GetBytes(jobId.ToString());

        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;

        channel.BasicPublish(
            exchange: string.Empty,
            routingKey: QueueName,
            basicProperties: properties,
            body: body);

        _logger.LogInformation("Job {JobId} publicado na fila {QueueName}", jobId, QueueName);

        return Task.CompletedTask;
    }
}
