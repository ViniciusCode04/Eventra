using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;

namespace JobProcessor.Application.Services;

public class JobService
{
    private readonly IJobRepository _jobRepository;
    private readonly IJobQueuePublisher _jobQueuePublisher;

    public JobService(IJobRepository jobRepository, IJobQueuePublisher jobQueuePublisher)
    {
        _jobRepository = jobRepository;
        _jobQueuePublisher = jobQueuePublisher;
    }

    public async Task<Job> CreateJobAsync(string type, string payload, CancellationToken cancellationToken = default)
    {
        var job = new Job
        {
            Type = type,
            Payload = payload
        };

        await _jobRepository.CreateAsync(job, cancellationToken);
        await _jobQueuePublisher.PublishAsync(job.Id, cancellationToken);

        return job;
    }

    public Task<Job?> GetJobAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _jobRepository.GetByIdAsync(id, cancellationToken);
    }

    public Task<IEnumerable<Job>> GetAllJobsAsync(CancellationToken cancellationToken = default)
    {
        return _jobRepository.GetAllAsync(cancellationToken);
    }
}
