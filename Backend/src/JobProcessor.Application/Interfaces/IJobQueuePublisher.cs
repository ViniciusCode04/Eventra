namespace JobProcessor.Application.Interfaces;

public interface IJobQueuePublisher
{
    Task PublishAsync(Guid jobId, CancellationToken cancellationToken = default);
}
