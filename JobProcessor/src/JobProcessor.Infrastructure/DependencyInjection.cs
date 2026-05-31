using JobProcessor.Application.Interfaces;
using JobProcessor.Domain.Entities;
using JobProcessor.Infrastructure.Email;
using JobProcessor.Infrastructure.Messaging;
using JobProcessor.Infrastructure.Persistence;
using JobProcessor.Infrastructure.Reports;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using RabbitMQ.Client;

namespace JobProcessor.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ConfigureMongoDbSerialization();

        services.AddSingleton<IMongoClient>(_ =>
            new MongoClient(configuration["MongoDB:ConnectionString"]));

        services.AddScoped<IJobRepository>(sp =>
        {
            var client = sp.GetRequiredService<IMongoClient>();
            var databaseName = configuration["MongoDB:DatabaseName"] ?? "jobprocessor";
            var database = client.GetDatabase(databaseName);
            return ActivatorUtilities.CreateInstance<MongoJobRepository>(sp, database);
        });

        services.AddSingleton<IConnection>(sp =>
        {
            var logger = sp.GetRequiredService<ILogger<RabbitMQPublisher>>();
            var factory = new ConnectionFactory
            {
                HostName = configuration["RabbitMQ:Host"] ?? "localhost",
                UserName = configuration["RabbitMQ:User"] ?? "guest",
                Password = configuration["RabbitMQ:Password"] ?? "guest",
                DispatchConsumersAsync = true
            };

            var retries = 10;
            for (int i = 1; i <= retries; i++)
            {
                try
                {
                    logger.LogInformation("Tentando conectar ao RabbitMQ ({Tentativa}/{Max})...", i, retries);
                    return factory.CreateConnection();
                }
                catch (Exception ex) when (i < retries)
                {
                    logger.LogWarning("RabbitMQ ainda não disponível: {Erro}. Aguardando 5s...", ex.Message);
                    Thread.Sleep(TimeSpan.FromSeconds(5));
                }
            }

            return factory.CreateConnection();
        });

        services.AddSingleton<IJobQueuePublisher, RabbitMQPublisher>();
        services.AddSingleton<IReportGenerator, ReportGenerator>();

        services.Configure<SmtpSettings>(configuration.GetSection(SmtpSettings.SectionName));
        services.AddSingleton<IEmailSender>(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<SmtpSettings>>().Value;
            return settings.IsConfigured
                ? ActivatorUtilities.CreateInstance<SmtpEmailSender>(sp)
                : ActivatorUtilities.CreateInstance<MockEmailSender>(sp);
        });

        return services;
    }

    private static void ConfigureMongoDbSerialization()
    {
        if (BsonClassMap.IsClassMapRegistered(typeof(Job)))
        {
            return;
        }

        BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

        BsonClassMap.RegisterClassMap<Job>(cm =>
        {
            cm.AutoMap();
            cm.MapIdMember(j => j.Id);
        });
    }
}