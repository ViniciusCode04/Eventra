using JobProcessor.Application.Handlers;
using JobProcessor.Application.Interfaces;
using JobProcessor.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace JobProcessor.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<JobService>();
        services.AddScoped<JobExecutor>();
        services.AddScoped<IJobHandler, SendEmailJobHandler>();
        services.AddScoped<IJobHandler, GenerateReportJobHandler>();

        return services;
    }
}
