using JobProcessor.Domain.Entities;

namespace JobProcessor.Application.Interfaces;

public interface IJobHandler
{
    string JobType { get; }

    Task HandleAsync(Job job, CancellationToken cancellationToken = default);
}
