using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;

namespace JobProcessor.Application.Services;

public class JobExecutor
{
    private readonly IEnumerable<IJobHandler> _handlers;

    public JobExecutor(IEnumerable<IJobHandler> handlers)
    {
        _handlers = handlers;
    }

    public Task ExecuteAsync(Job job, CancellationToken cancellationToken = default)
    {
        var handler = _handlers.FirstOrDefault(h =>
            string.Equals(h.JobType, job.Type, StringComparison.OrdinalIgnoreCase));

        if (handler is null)
        {
            throw new InvalidOperationException($"Nenhum handler registrado para o tipo de job '{job.Type}'.");
        }

        return handler.HandleAsync(job, cancellationToken);
    }
}
