using JobProcessor.Domain.Entities;

namespace JobProcessor.Application.Interfaces;

public interface IJobRepository
{
    Task<Job> CreateAsync(Job job, CancellationToken cancellationToken = default);
    Task<Job?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Job>> GetAllAsync(CancellationToken cancellationToken = default);
    Task UpdateAsync(Job job, CancellationToken cancellationToken = default);
    Task<Job?> TryAcquireAsync(Guid jobId, CancellationToken cancellationToken = default);
}
