using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;
using JobProcessor.Domain.Enums;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace JobProcessor.Infrastructure.Persistence;

public class MongoJobRepository : IJobRepository
{
    private readonly IMongoCollection<Job> _collection;
    private readonly ILogger<MongoJobRepository> _logger;

    public MongoJobRepository(IMongoDatabase database, ILogger<MongoJobRepository> logger)
    {
        _collection = database.GetCollection<Job>("jobs");
        _logger = logger;
    }

    public async Task<Job> CreateAsync(Job job, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(job, cancellationToken: cancellationToken);
        _logger.LogInformation("Job {JobId} criado com status {Status}", job.Id, job.Status);
        return job;
    }

    public async Task<Job?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _collection.Find(j => j.Id == id).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<Job>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _collection.Find(_ => true).ToListAsync(cancellationToken);
    }

    public async Task UpdateAsync(Job job, CancellationToken cancellationToken = default)
    {
        job.UpdatedAt = DateTime.UtcNow;
        await _collection.ReplaceOneAsync(j => j.Id == job.Id, job, cancellationToken: cancellationToken);
        _logger.LogInformation("Job {JobId} atualizado para status {Status}", job.Id, job.Status);
    }

    public async Task<Job?> TryAcquireAsync(Guid jobId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Job>.Filter.And(
            Builders<Job>.Filter.Eq(j => j.Id, jobId),
            Builders<Job>.Filter.Eq(j => j.Status, JobStatus.Pendente));

        var update = Builders<Job>.Update
            .Set(j => j.Status, JobStatus.EmProcessamento)
            .Set(j => j.UpdatedAt, DateTime.UtcNow);

        var options = new FindOneAndUpdateOptions<Job>
        {
            ReturnDocument = ReturnDocument.After
        };

        return await _collection.FindOneAndUpdateAsync(filter, update, options, cancellationToken);
    }
}
